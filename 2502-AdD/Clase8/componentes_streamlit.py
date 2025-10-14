import streamlit as st
import pandas as pd

st.title('📚 Componentes de Streamlit')

# ========================================
# 1. TEXTO Y TÍTULOS
# ========================================
st.header('1. Texto y Títulos')
st.subheader('Esto es un subheader')
st.text('Texto normal')
st.markdown('**Negrita** y *cursiva* y `código`')
st.code('print("Hola Mundo")', language='python')

st.markdown('---')

# ========================================
# 2. INPUTS EN SIDEBAR
# ========================================
st.header('2. Widgets de Input')

col1, col2 = st.columns(2)

with col1:
    st.subheader('Sidebar Inputs')
    
    opcion = st.sidebar.selectbox(
        'Select Box (escoge 1)',
        ['Opción A', 'Opción B', 'Opción C']
    )
    st.write(f'Seleccionaste: {opcion}')
    
    multi = st.sidebar.multiselect(
        'Multi-Select (escoge varios)',
        ['A', 'B', 'C', 'D'],
        default=['A']
    )
    st.write(f'Seleccionaste: {multi}')
    
    numero = st.sidebar.slider(
        'Slider',
        min_value=0,
        max_value=100,
        value=50
    )
    st.write(f'Valor: {numero}')

with col2:
    st.subheader('Más Inputs')
    
    radio = st.sidebar.radio(
        'Radio Buttons',
        ['Opción 1', 'Opción 2', 'Opción 3']
    )
    st.write(f'Radio: {radio}')
    
    check = st.sidebar.checkbox('Checkbox')
    st.write(f'Checked: {check}')
    
    texto = st.sidebar.text_input('Text Input', 'Escribe aquí')
    st.write(f'Texto: {texto}')

st.markdown('---')

# ========================================
# 3. MOSTRAR DATOS
# ========================================
st.header('3. Mostrar Datos')

df = pd.DataFrame({
    'Columna A': [1, 2, 3, 4],
    'Columna B': [10, 20, 30, 40]
})

col1, col2, col3 = st.columns(3)

with col1:
    st.subheader('DataFrame')
    st.dataframe(df)

with col2:
    st.subheader('Table')
    st.table(df)

with col3:
    st.subheader('Metric')
    st.metric('Total', 100, delta=10)

st.markdown('---')

# ========================================
# 4. LAYOUTS
# ========================================
st.header('4. Layouts')

# Columnas
st.subheader('Columnas')
col1, col2, col3 = st.columns(3)
col1.write('Columna 1')
col2.write('Columna 2')
col3.write('Columna 3')

# Tabs
st.subheader('Tabs')
tab1, tab2, tab3 = st.tabs(['Tab 1', 'Tab 2', 'Tab 3'])
with tab1:
    st.write('Contenido Tab 1')
with tab2:
    st.write('Contenido Tab 2')
with tab3:
    st.write('Contenido Tab 3')

# Expander
st.subheader('Expander')
with st.expander('Click para expandir'):
    st.write('Contenido oculto que se revela al click')

# Contenedor
st.subheader('Container')
container = st.container()
container.write('Esto está en un contenedor')