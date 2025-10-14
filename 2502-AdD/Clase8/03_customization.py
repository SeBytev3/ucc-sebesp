import plotly.express as px
import pandas as pd

df = pd.read_csv('https://raw.githubusercontent.com/plotly/datasets/master/gapminder_with_codes.csv')

# ========================================
# BEFORE - Basic chart (minimal code)
# ========================================
fig_basic = px.scatter(
    df.query("year==2007"),
    x='gdpPercap',
    y='lifeExp'
)
fig_basic.show()

# ========================================
# AFTER - Professional chart (with customization)
# ========================================
fig_professional = px.scatter(
    df.query("year==2007"),
    x='gdpPercap',
    y='lifeExp',
    size='pop',                      # Add bubble sizes
    color='continent',               # Add color coding
    hover_name='country',            # Add hover labels
    title='Global Development Analysis',
    labels={                         # Rename axes for clarity
        'gdpPercap': 'GDP per Capita (USD)',
        'lifeExp': 'Life Expectancy (years)',
        'pop': 'Population',
        'continent': 'Continent'
    }
)

# ========================================
# ADVANCED CUSTOMIZATION with update_layout()
# ========================================
# This is where the magic happens!

fig_professional.update_layout(
    # Custom title formatting
    title={
        'text': 'Global Human Development Analysis',
        'x': 0.5,                    # Center the title
        'font': {'size': 20, 'color': '#2c3e50'}
    },

    # Visual theme
    # Options: 'plotly_dark', 'ggplot2', 'seaborn', 'plotly_white'
    template='plotly_white',

    # Chart dimensions
    height=600,
    width=900,

    # Background colors
    paper_bgcolor='#f8f9fa',         # Outer background
    plot_bgcolor='white',            # Chart area background

    # Legend configuration
    legend=dict(
        title='Continent',
        orientation='v',             # Vertical orientation
        x=1.02,                      # Position to the right
        y=1                          # Align to top
    ),

    # Hover interaction mode
    hovermode='closest'              # Snap to nearest point
)

# ========================================
# AXIS CUSTOMIZATION
# ========================================

# X-axis (GDP)
fig_professional.update_xaxes(
    showgrid=True,                   # Show gridlines
    gridwidth=1,
    gridcolor='lightgray',
    type='log'                       # Logarithmic scale for better spread
)

# Y-axis (Life Expectancy)
fig_professional.update_yaxes(
    showgrid=True,
    range=[30, 90]                   # Fixed range for consistency
)

fig_professional.show()