import streamlit as st
import pandas as pd
import plotly.express as px

# ========================================
# CONFIGURACIÓN
# ========================================
st.set_page_config(
    page_title='Estaciones IDEAM - Dashboard',
    layout='wide',
    page_icon='🌞'
)

# ========================================
# CARGAR DATOS
# ========================================
@st.cache_data
def load_data():
    # Actualiza aquí la ruta si cambia tu archivo
    return pd.read_csv("C:/Users/ASIS-INFORMATICA/Desarrollo/ReposUCC/2502-AdD/Proyecto/Datos_de_Estaciones_de_IDEAM_y_de_Terceros_20250902.csv")

df = load_data()

# ========================================
# LIMPIEZA Y PREPARACIÓN
# ========================================
# Detectar columnas relevantes
lat_col = [col for col in df.columns if 'lat' in col.lower()][0]
lon_col = [col for col in df.columns if 'lon' in col.lower() or 'lng' in col.lower()][0]
name_col = [col for col in df.columns if 'nombre' in col.lower()][0]

# Si tienes columna de país úsala, si no, asumimos "Colombia"
if 'País' in df.columns:
    df['País'] = df['País'].fillna('Colombia')
else:
    df['País'] = 'Colombia'

# ========================================
# SIDEBAR: FILTROS
# ========================================
st.sidebar.header('🎛️ Filtros')
countries = df['País'].unique().tolist()
country = st.sidebar.selectbox('🌎 País', countries)
df_country = df[df['País'] == country]

st.sidebar.markdown('---')
departamentos = df_country['Departamento'].unique().tolist()
dep_select = st.sidebar.multiselect('Departamento', departamentos, default=departamentos)

df_filtered = df_country[df_country['Departamento'].isin(dep_select)]

show_data = st.sidebar.checkbox('Mostrar datos crudos')

# ========================================
# HEADER Y MÉTRICAS
# ========================================
st.title('🌞 Dashboard Estaciones IDEAM')
st.markdown(f'**Total Estaciones en {country}:** {len(df_country)}')
st.markdown('---')

col1, col2, col3 = st.columns(3)
col1.metric('Estaciones', len(df_filtered))
col2.metric('Departamentos', df_filtered['Departamento'].nunique())
col3.metric('Municipios', df_filtered['Municipio'].nunique())

# ========================================
# MAPA DE ESTACIONES
# ========================================
st.subheader('🗺️ Mapa de Estaciones IDEAM')

fig = px.scatter_mapbox(
    df_filtered,
    lat=lat_col,
    lon=lon_col,
    hover_name=name_col,
    hover_data=['Departamento', 'Municipio'],
    color='Departamento',
    zoom=4,
    height=500
)
fig.update_layout(mapbox_style='open-street-map')
fig.update_layout(margin={"r":0,"t":0,"l":0,"b":0})

st.plotly_chart(fig, use_container_width=True)

# ========================================
# TABS: EXPLORACIÓN ADICIONAL
# ========================================
tab1, tab2 = st.tabs(['Estaciones', 'Distribución'])

with tab1:
    st.subheader('Tabla de Estaciones')
    st.dataframe(df_filtered, use_container_width=True)

with tab2:
    st.subheader('Distribución de Estaciones por Departamento')
    dep_counts = df_filtered['Departamento'].value_counts().reset_index()
    dep_counts.columns = ['Departamento', 'Num Estaciones']
    fig2 = px.bar(dep_counts, x='Departamento', y='Num Estaciones', color='Num Estaciones')
    st.plotly_chart(fig2, use_container_width=True)

# ========================================
# DESCARGA
# ========================================
if show_data:
    st.subheader('📋 Datos Crudos')
    st.dataframe(df_filtered, use_container_width=True)
    csv = df_filtered.to_csv(index=False).encode('utf-8')
    st.download_button('⬇️ Descargar CSV', csv, 'datos_filtrados.csv', 'text/csv')
