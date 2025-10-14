import streamlit as st
import plotly.express as px
import pandas as pd

# ========================================
# PAGE CONFIGURATION
# ========================================
# THIS MUST BE THE FIRST STREAMLIT COMMAND
st.set_page_config(
    page_title='My Dashboard',      # Browser tab title
    page_icon='📊',                  # Browser tab icon
    layout='wide'                    # Use full width of browser
)

# ========================================
# TITLE
# ========================================
st.title('🌍 My First Interactive Dashboard')
st.markdown('---')  # Horizontal line

# ========================================
# LOAD DATA (with caching for performance)
# ========================================
# @st.cache_data makes Streamlit remember the data
# so it doesn't reload every time the app updates
@st.cache_data
def load_data():
    return pd.read_csv('https://raw.githubusercontent.com/plotly/datasets/master/gapminder_with_codes.csv')

df = load_data()

# ========================================
# SIDEBAR - FILTERS
# ========================================
st.sidebar.header('🎛️ Filters')

# Slider for year selection
year = st.sidebar.slider(
    'Year',
    min_value=int(df['year'].min()),  # Earliest year
    max_value=int(df['year'].max()),  # Latest year
    value=2007                         # Default value
)

# Multi-select for continents
continents = st.sidebar.multiselect(
    'Continents',
    options=df['continent'].unique(),    # All available continents
    default=df['continent'].unique()     # Select all by default
)

# ========================================
# FILTER DATA based on user selections
# ========================================
df_filtered = df[(df['year']==year) & (df['continent'].isin(continents))]

# ========================================
# KEY METRICS - Top of dashboard
# ========================================
col1, col2, col3 = st.columns(3)  # Create 3 equal columns

with col1:
    st.metric(
        '🌍 Countries',
        len(df_filtered),
        help='Total countries in selection'
    )

with col2:
    st.metric(
        '👥 Total Population',
        f"{df_filtered['pop'].sum()/1e9:.2f}B"  # Convert to billions
    )

with col3:
    st.metric(
        '❤️ Average Life Expectancy',
        f"{df_filtered['lifeExp'].mean():.1f} years"
    )

st.markdown('---')

# ========================================
# MAIN CHART
# ========================================
st.subheader(f'📊 Global Development - {year}')

# Create Plotly chart
fig = px.scatter(
    df_filtered,
    x='gdpPercap',
    y='lifeExp',
    size='pop',
    color='continent',
    hover_name='country',
    log_x=True,
    title=f'GDP vs Life Expectancy ({year})'
)

# Display chart in Streamlit
# use_container_width=True makes it responsive
st.plotly_chart(fig, use_container_width=True)

# ========================================
# DATA TABLE (optional toggle)
# ========================================
if st.checkbox('📋 Show raw data'):
    st.dataframe(df_filtered, use_container_width=True)