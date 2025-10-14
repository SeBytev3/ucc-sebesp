import streamlit as st
import pandas as pd
import plotly.express as px

# ========================================
# CONFIGURACIÓN
# ========================================
st.set_page_config(
    page_title='Estaciones IDEAM - Colombia',
    layout='wide',
    page_icon='🌞'
)

# ========================================
# CARGAR DATOS
# ========================================
@st.cache_data
def load_data():
    return pd.read_csv("C:/Users/ASIS-INFORMATICA/Desarrollo/ReposUCC/2502-AdD/Proyecto/Datos_de_Estaciones_de_IDEAM_y_de_Terceros_20250902.csv")

df = load_data()

# ========================================
# LIMPIEZA Y PREPARACIÓN
# ========================================
lat_col = [col for col in df.columns if 'lat' in col.lower()][0]
lon_col = [col for col in df.columns if 'lon' in col.lower() or 'lng' in col.lower()][0]
name_col = [col for col in df.columns if 'nombre' in col.lower()][0]

COLOMBIA_BOUNDS = {
    'lat_min': -5.0,
    'lat_max': 15.0,
    'lon_min': -82.5,  # Incluye archipiélago
    'lon_max': -66.5
}
mask = (
    (df[lat_col].astype(float) >= COLOMBIA_BOUNDS['lat_min']) &
    (df[lat_col].astype(float) <= COLOMBIA_BOUNDS['lat_max']) &
    (df[lon_col].astype(float) >= COLOMBIA_BOUNDS['lon_min']) &
    (df[lon_col].astype(float) <= COLOMBIA_BOUNDS['lon_max'])
)
df = df[mask].copy()
df['Departamento'] = df['Departamento'].str.upper().str.strip()

# ========================================
# FILTRO ARRIBA (NO SOLO EN SIDEBAR)
# ========================================
departamentos = sorted(df['Departamento'].unique())
departamentos_combo = ["Todos los departamentos"] + departamentos

# Filtro principal en la parte superior
selected_dep = st.sidebar.selectbox(
    "Exactamente el departamento:",
    departamentos_combo,
    index=0
)

if selected_dep == "Todos los departamentos":
    df_filtered = df
else:
    df_filtered = df[df['Departamento'] == selected_dep]

st.sidebar.header('Opciones')
show_data = st.sidebar.checkbox('Mostrar datos crudos')

# ========================================
# HEADER Y MÉTRICAS
# ========================================
st.title('🌞 Dashboard Estaciones IDEAM - Solo Colombia')
st.markdown(f'**Total Estaciones en Colombia:** {len(df)}')
st.markdown('---')

col1, col2, col3 = st.columns(3)
col1.metric('Estaciones', len(df_filtered))
col2.metric('Municipios', df_filtered['Municipio'].nunique())
col3.metric('Latitud Promedio', f"{df_filtered[lat_col].mean():.3f}")

# ========================================
# MAPA DE ESTACIONES
# ========================================
if selected_dep == "Todos los departamentos":
    subtitle = '🗺️ Mapa de todas las estaciones en Colombia'
    zoom = 4.2
else:
    subtitle = f'🗺️ Mapa de Estaciones en {selected_dep}'
    zoom = 5 if selected_dep != 'ARCHIPIELAGO DE SAN ANDRES PROVIDENCIA Y SANTA CATALINA' else 7

st.subheader(subtitle)
fig = px.scatter_mapbox(
    df_filtered,
    lat=lat_col,
    lon=lon_col,
    hover_name=name_col,
    hover_data=['Municipio'],
    color='Municipio',
    zoom=zoom,
    height=500
)
fig.update_layout(mapbox_style='open-street-map')
fig.update_layout(margin={"r":0,"t":0,"l":0,"b":0})
st.plotly_chart(fig, use_container_width=True)

# ========================================
# TABS: GRÁFICAS PRINCIPALES
# ========================================
tab1, tab2, tab3 = st.tabs(['Distribución por Municipio', 'Histograma Latitudes', 'Otros Análisis'])

with tab1:
    st.subheader('Distribución de estaciones por municipio')
    counts = df_filtered['Municipio'].value_counts().reset_index()
    counts.columns = ['Municipio', 'Num Estaciones']
    fig1 = px.bar(counts, x='Municipio', y='Num Estaciones', color='Num Estaciones')
    st.plotly_chart(fig1, use_container_width=True)

with tab2:
    st.subheader('Histograma de latitudes de las estaciones')
    fig2 = px.histogram(df_filtered, x=lat_col, nbins=20, color='Municipio')
    st.plotly_chart(fig2, use_container_width=True)

with tab3:
    st.subheader('Scatter longitud vs latitud')
    fig3 = px.scatter(
        df_filtered,
        x=lon_col, y=lat_col,
        color='Municipio',
        hover_name=name_col,
        title='Ubicación geográfica (Longitud vs Latitud)'
    )
    st.plotly_chart(fig3, use_container_width=True)
    st.info("Puedes agregar aquí otras gráficas que tengas del notebook.")

# ========================================
# DATOS CRUDOS Y DESCARGA
# ========================================
if show_data:
    st.subheader('📋 Datos Crudos')
    st.dataframe(df_filtered, use_container_width=True)
    csv = df_filtered.to_csv(index=False).encode('utf-8')
    st.download_button('⬇️ Descargar CSV', csv, 'datos_filtrados.csv', 'text/csv')
