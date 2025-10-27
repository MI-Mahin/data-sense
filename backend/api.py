from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import mysql.connector
from dotenv import load_dotenv
import requests
import json
import pandas as pd
import numpy as np
from datetime import datetime
import plotly.express as px
from decimal import Decimal

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for Next.js frontend

class AdvancedPromptToSQL:
    def __init__(self):
        """Initialize database connection and Gemini API"""
        self.db_config = {
            'host': os.getenv('DB_HOST', 'localhost'),
            'user': os.getenv('DB_USER', 'root'),
            'password': os.getenv('DB_PASSWORD'),
            'database': os.getenv('DB_NAME')
        }
        
        self.api_key = os.getenv('GEMINI_API_KEY')
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found")
        
        self.model_name = self.get_available_model()
        self.api_url = f"https://generativelanguage.googleapis.com/v1/models/{self.model_name}:generateContent?key={self.api_key}"
        
        self.schema_info = self.get_database_schema()
        
        if not os.path.exists('outputs'):
            os.makedirs('outputs')
    
    def get_available_model(self):
        """Get available Gemini model"""
        list_url = f"https://generativelanguage.googleapis.com/v1/models?key={self.api_key}"
        
        try:
            response = requests.get(list_url, timeout=10)
            if response.status_code == 200:
                models_data = response.json()
                if 'models' in models_data:
                    preferred_models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro']
                    
                    available_models = []
                    for model in models_data['models']:
                        model_name = model.get('name', '').replace('models/', '')
                        supported_methods = model.get('supportedGenerationMethods', [])
                        if 'generateContent' in supported_methods:
                            available_models.append(model_name)
                    
                    for preferred in preferred_models:
                        for available in available_models:
                            if preferred in available:
                                return available
                    
                    if available_models:
                        return available_models[0]
        except:
            pass
        
        return 'gemini-1.5-flash'
    
    def get_database_schema(self):
        """Retrieve database schema"""
        try:
            conn = mysql.connector.connect(**self.db_config)
            cursor = conn.cursor()
            
            schema = []
            cursor.execute("SHOW TABLES")
            tables = cursor.fetchall()
            
            for (table_name,) in tables:
                schema.append(f"\nTable: {table_name}")
                cursor.execute(f"DESCRIBE {table_name}")
                columns = cursor.fetchall()
                
                for column in columns:
                    col_name, col_type, null, key, default, extra = column
                    schema.append(f"  - {col_name} ({col_type}){' PRIMARY KEY' if key == 'PRI' else ''}")
            
            cursor.close()
            conn.close()
            
            return "\n".join(schema)
        
        except mysql.connector.Error as err:
            return f"Error: {err}"
    
    def generate_sql_query(self, prompt):
        """Generate SQL from natural language"""
        system_instruction = f"""You are a MySQL query generator.

Database Schema:
{self.schema_info}

RULES:
1. Generate ONLY the SQL query
2. Use proper MySQL syntax
3. Return only SELECT statements
4. Support JOIN operations
5. Use aggregate functions when needed
6. No markdown or code blocks
7. No semicolon
8. Return ONLY raw SQL

User Question: {prompt}

SQL Query:"""

        payload = {
            "contents": [{"parts": [{"text": system_instruction}]}],
            "generationConfig": {"temperature": 0, "maxOutputTokens": 500}
        }

        try:
            response = requests.post(self.api_url, headers={'Content-Type': 'application/json'}, 
                                    json=payload, timeout=30)
            
            if response.status_code != 200:
                return None, f"API Error {response.status_code}"
            
            result = response.json()
            
            if 'candidates' in result and len(result['candidates']) > 0:
                sql_query = result['candidates'][0]['content']['parts'][0]['text'].strip()
            else:
                return None, "No response generated"
            
            sql_query = sql_query.replace('```sql', '').replace('```', '').strip().strip('"\'')
            
            if 'SELECT' in sql_query.upper():
                select_index = sql_query.upper().find('SELECT')
                sql_query = sql_query[select_index:]
            
            return sql_query.rstrip(';').strip(), None
        
        except Exception as e:
            return None, f"Error: {str(e)}"
    
    def execute_query(self, sql_query):
        """Execute SQL query"""
        try:
            conn = mysql.connector.connect(**self.db_config)
            cursor = conn.cursor()
            
            cursor.execute(sql_query)
            results = cursor.fetchall()
            column_names = [desc[0] for desc in cursor.description]
            
            cursor.close()
            conn.close()
            
            # Convert to JSON-serializable format
            json_results = []
            for row in results:
                json_row = {}
                for i, col in enumerate(column_names):
                    val = row[i]
                    if isinstance(val, Decimal):
                        json_row[col] = float(val)
                    elif isinstance(val, datetime):
                        json_row[col] = val.isoformat()
                    else:
                        json_row[col] = val
                json_results.append(json_row)
            
            return json_results, column_names, None
        
        except mysql.connector.Error as err:
            return None, None, f"Error: {err}"
    
    def create_visualization(self, data, columns, chart_type, x_col, y_col):
        """Create visualization"""
        try:
            df = pd.DataFrame(data)
            
            if chart_type == 'bar':
                fig = px.bar(df, x=x_col, y=y_col, title=f'{y_col} by {x_col}')
            elif chart_type == 'pie':
                fig = px.pie(df, names=x_col, values=y_col, title=f'{y_col} Distribution')
            elif chart_type == 'line':
                fig = px.line(df, x=x_col, y=y_col, title=f'{y_col} Trend')
            else:
                return None, "Unknown chart type"
            
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"outputs/{chart_type}_chart_{timestamp}.html"
            fig.write_html(filename)
            
            return filename, None
        
        except Exception as e:
            return None, f"Error: {str(e)}"

# Global converter instance
converter = None

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "API is running"})

@app.route('/api/schema', methods=['GET'])
def get_schema():
    """Get database schema"""
    global converter
    if converter is None:
        converter = AdvancedPromptToSQL()
    
    return jsonify({"schema": converter.schema_info})

@app.route('/api/query', methods=['POST'])
def execute_query():
    """Execute natural language query"""
    global converter
    if converter is None:
        converter = AdvancedPromptToSQL()
    
    data = request.json
    prompt = data.get('prompt', '')
    
    if not prompt:
        return jsonify({"error": "No prompt provided"}), 400
    
    # Generate SQL
    sql_query, error = converter.generate_sql_query(prompt)
    
    if error:
        return jsonify({"error": error}), 500
    
    # Execute SQL
    results, columns, error = converter.execute_query(sql_query)
    
    if error:
        return jsonify({
            "sql_query": sql_query,
            "error": error
        }), 500
    
    return jsonify({
        "sql_query": sql_query,
        "results": results,
        "columns": columns,
        "row_count": len(results)
    })

@app.route('/api/visualize', methods=['POST'])
def create_visualization():
    """Create visualization"""
    global converter
    if converter is None:
        converter = AdvancedPromptToSQL()
    
    data = request.json
    results = data.get('results', [])
    columns = data.get('columns', [])
    chart_type = data.get('chart_type', 'bar')
    x_col = data.get('x_column', '')
    y_col = data.get('y_column', '')
    
    filename, error = converter.create_visualization(results, columns, chart_type, x_col, y_col)
    
    if error:
        return jsonify({"error": error}), 500
    
    return jsonify({"filename": filename, "message": "Visualization created"})

@app.route('/api/export', methods=['POST'])
def export_data():
    """Export data to CSV"""
    data = request.json
    results = data.get('results', [])
    
    if not results:
        return jsonify({"error": "No data to export"}), 400
    
    df = pd.DataFrame(results)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"outputs/export_{timestamp}.csv"
    df.to_csv(filename, index=False)
    
    return jsonify({"filename": filename, "message": "Data exported"})

if __name__ == '__main__':
    print("Starting Flask API on http://localhost:5000")
    app.run(debug=True, port=5000)