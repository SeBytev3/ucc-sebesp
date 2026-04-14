import streamlit as st
import pandas as pd
import plotly.express as px
import geopandas as gpd

# ========================================
# CONFIGURACIÓN GENERAL
# ========================================
st.set_page_config(
    page_title='Estaciones IDEAM - Dashboard',
    layout='wide',
    page_icon='🌞'
)

# ========================================
# CARGA DE DATOS
# ========================================
@st.cache_data
def load_data():
    return pd.read_csv(
        "C:/Users/ASIS-INFORMATICA/Desarrollo/ReposUCC/2502-AdD/Proyecto/precipitacion_valle_cauca.csv",
        parse_dates=['FechaObservacion']
    )

@st.cache_data
def load_geo():
    # GeoJSON/Shapefile de municipios colombianos
    return gpd.read_file("COLOMBIA_MGN_MUNICIPIOS.geojson")

df = load_data()
gdf = load_geo()

# ========================================
# LIMPIEZA Y CAMPOS DERIVADOS
# ========================================
lat_col = [c for c in df.columns if 'lat' in c.lower()][0]
lon_col = [c for c in df.columns if 'lon' in c.lower() or 'lng' in c.lower()][0]
name_col = [c for c in df.columns if 'nombre' in c.lower()][0]

df['País'] = 'Colombia'  # si no existe columna País
df['Año'] = df['FechaObservacion'].dt.year
df['Mes'] = df['FechaObservacion'].dt.month

# ========================================
# SIDEBAR DE FILTROS
# ========================================
st.sidebar.header('🎛️ Filtros')
country = st.sidebar.selectbox('🌎 País', ['Colombia'])
departamentos = df['Departamento'].unique().tolist()
dep_select = st.sidebar.multiselect('Departamento', departamentos, default=['VALLE DEL CAUCA'])

df_filtered = df[df['Departamento'].isin(dep_select)]
show_data = st.sidebar.checkbox('Mostrar datos crudos')

# ========================================
# HEADER Y MÉTRICAS
# ========================================
st.title('🌞 Dashboard Estaciones IDEAM')
st.markdown('---')

col1, col2, col3 = st.columns(3)
col1.metric('Estaciones', len(df_filtered))
col2.metric('Departamentos', df_filtered['Departamento'].nunique())
col3.metric('Municipios', df_filtered['Municipio'].nunique())

# ========================================
# 1. MAPA GENERAL DE ESTACIONES
# ========================================
st.subheader('🗺️ Mapa de Estaciones (filtros aplicados)')

fig = px.scatter_mapbox(
    df_filtered,
    lat=lat_col, lon=lon_col,
    hover_name=name_col,
    hover_data=['Departamento', 'Municipio'],
    color='Departamento',
    zoom=5, height=500
)
fig.update_layout(mapbox_style='open-street-map', margin=dict(r=0, t=0, l=0, b=0))
st.plotly_chart(fig, use_container_width=True)

# ========================================
# 2. MAPA FOCALIZADO EN VALLE DEL CAUCA
# ========================================
st.subheader('🔍 Foco: Valle del Cauca – Municipios recomendados')

destacados = ['RIOFRÍO', 'BUGA', 'SEVILLA']
valle = gdf[gdf['DPTO_CNMBR'].str.upper() == 'VALLE DEL CAUCA'].copy()
valle['color'] = valle['MPIO_CNMBR'].str.upper().apply(
    lambda x: 'green' if x in destacados else 'lightgray'
)

fig_valle = px.choropleth_mapbox(
    valle,
    geojson=valle.__geo_interface__,
    locations=valle.index,
    color='color',
    color_discrete_map='identity',
    center={'lat': 3.9, 'lon': -76.3},
    zoom=7,
    opacity=0.6,
    height=500
)
fig_valle.update_layout(
    mapbox_style='open-street-map',
    showlegend=False,
    margin=dict(r=0, t=0, l=0, b=0)
)
st.plotly_chart(fig_valle, use_container_width=True)

# ========================================
# 3. DISTRIBUCIÓN MENSUAL POR MUNICIPIO
# ========================================
st.subheader('📅 Mes más lluvioso por municipio (top 6)')

# Precipitación total mensual
mensual = (df_filtered
           .groupby(['Municipio', 'Año', 'Mes'])['ValorObservado']
           .sum()
           .reset_index())

# Obtener mes pico de cada municipio
mes_max = (mensual
           .sort_values('ValorObservado', ascending=False)
           .groupby('Municipio')
           .head(1)               # fila con pico
           .sort_values('ValorObservado', ascending=False)
           .head(6)               # mostrar top 6 municipios más lluviosos
)

fig_top = px.bar(
    mes_max,
    x='Municipio', y='ValorObservado',
    color='Mes',
    text='Mes',
    labels={'ValorObservado': 'mm', 'Mes': 'Mes'},
    title='Mes pico de precipitación (mm) – Municipios más lluviosos'
)
fig_top.update_layout(height=500)
st.plotly_chart(fig_top, use_container_width=True)

# ========================================
# 4. HEAT-MAP DE MESES POR MUNICIPIO
# ========================================
st.subheader('🌧️ Heat-map mensual de precipitaciones')

pivot = mensual.pivot_table(values='ValorObservado',
                            index='Municipio',
                            columns='Mes', aggfunc='sum', fill_value=0)

fig_heat = px.imshow(
    pivot,
    aspect='auto',
    color_continuous_scale='Blues',
    labels=dict(color='mm / mes'),
    height=500
)
fig_heat.update_layout(
    xaxis_title='Mes',
    yaxis_title='Municipio',
    title='Mapa de calor: precipitación mensual por municipio'
)
st.plotly_chart(fig_heat, use_container_width=True)

# ========================================
# 5. TABLAS & DESCARGA
# ========================================
st.subheader('📋 Datos filtrados')
st.dataframe(df_filtered, use_container_width=True)

csv = df_filtered.to_csv(index=False).encode('utf-8')
st.download_button('⬇️ Descargar CSV filtrado', csv, 'datos_filtrados.csv', 'text/csv')

# ========================================
# MOSTRAR DATOS CRUDOS (opcional)
# ========================================
if show_data:
    st.markdown('---')
    st.subheader('🔎 Datos crudos (vista completa)')
    st.dataframe(df, use_container_width=True)
