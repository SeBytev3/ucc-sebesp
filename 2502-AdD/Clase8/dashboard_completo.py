import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import pandas as pd

# ========================================
# CONFIGURACIÓN
# ========================================
st.set_page_config(
    page_title='Dashboard Analítica', 
    layout='wide', 
    page_icon='📊'
)

# ========================================
# CARGAR DATOS
# ========================================
@st.cache_data
def load_data():
    return pd.read_csv('https://raw.githubusercontent.com/plotly/datasets/master/gapminder_with_codes.csv')

df = load_data()

# ========================================
# HEADER
# ========================================
st.title('📊 Dashboard de Análisis Global')
st.markdown('**Análisis de Desarrollo Humano por País y Continente**')
st.markdown('---')

# ========================================
# SIDEBAR
# ========================================
st.sidebar.title('🎛️ Controles')
st.sidebar.markdown('---')

year = st.sidebar.slider(
    '📅 Año', 
    1952, 2007, 2007, 5
)

continents = st.sidebar.multiselect(
    '🌍 Continentes',
    df['continent'].unique(), 
    default=df['continent'].unique()
)

show_data = st.sidebar.checkbox('📋 Mostrar datos crudos')

st.sidebar.markdown('---')
st.sidebar.markdown('**Creado con:**')
st.sidebar.markdown('🐍 Python + Plotly + Streamlit')

# ========================================
# FILTRAR DATOS
# ========================================
df_filtered = df[(df['year']==year) & (df['continent'].isin(continents))]

# ========================================
# MÉTRICAS TOP
# ========================================
col1, col2, col3, col4 = st.columns(4)

col1.metric(
    '🌍 Países',
    len(df_filtered),
    help='Total de países'
)

col2.metric(
    '👥 Población',
    f"{df_filtered['pop'].sum()/1e9:.2f}B"
)

col3.metric(
    '💰 PIB Promedio',
    f"${df_filtered['gdpPercap'].mean():,.0f}"
)

col4.metric(
    '❤️ Esperanza Vida',
    f"{df_filtered['lifeExp'].mean():.1f} años"
)

st.markdown('---')

# ========================================
# TABS PRINCIPALES
# ========================================
tab1, tab2, tab3 = st.tabs(['📈 Análisis General', '🗺️ Por Continente', '📊 Distribuciones'])

# ========================================
# TAB 1: ANÁLISIS GENERAL
# ========================================
with tab1:
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader('PIB vs Esperanza de Vida')
        fig1 = px.scatter(
            df_filtered, 
            x='gdpPercap', 
            y='lifeExp', 
            size='pop', 
            color='continent', 
            hover_name='country',
            log_x=True
        )
        st.plotly_chart(fig1, use_container_width=True)
    
    with col2:
        st.subheader('Evolución Temporal Promedio')
        df_evolution = df[df['continent'].isin(continents)].groupby('year').agg({
            'lifeExp': 'mean',
            'gdpPercap': 'mean'
        }).reset_index()
        
        fig2 = go.Figure()
        fig2.add_trace(go.Scatter(
            x=df_evolution['year'], 
            y=df_evolution['lifeExp'],
            mode='lines+markers', 
            name='Esperanza Vida',
            line=dict(color='green', width=3)
        ))
        fig2.update_layout(height=400)
        st.plotly_chart(fig2, use_container_width=True)

# ========================================
# TAB 2: POR CONTINENTE
# ========================================
with tab2:
    continent_select = st.selectbox(
        'Selecciona Continente',
        continents
    )
    
    df_continent = df_filtered[df_filtered['continent']==continent_select].nlargest(10, 'pop')
    
    fig3 = px.bar(
        df_continent, 
        x='country', 
        y='pop', 
        title=f'Top 10 Países por Población - {continent_select}',
        color='pop',
        color_continuous_scale='Blues'
    )
    st.plotly_chart(fig3, use_container_width=True)

# ========================================
# TAB 3: DISTRIBUCIONES
# ========================================
with tab3:
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader('Distribución Esperanza de Vida')
        fig4 = px.histogram(
            df_filtered, 
            x='lifeExp', 
            nbins=20,
            color='continent'
        )
        st.plotly_chart(fig4, use_container_width=True)
    
    with col2:
        st.subheader('Distribución PIB por Continente')
        fig5 = px.box(
            df_filtered, 
            x='continent', 
            y='gdpPercap',
            color='continent'
        )
        st.plotly_chart(fig5, use_container_width=True)

# ========================================
# DATOS CRUDOS
# ========================================
if show_data:
    st.markdown('---')
    st.subheader('📋 Datos Crudos')
    st.dataframe(df_filtered, use_container_width=True)
    
    # Botón de descarga
    csv = df_filtered.to_csv(index=False).encode('utf-8')
    st.download_button(
        '⬇️ Descargar CSV',
        csv,
        'datos_filtrados.csv',
        'text/csv'
    )