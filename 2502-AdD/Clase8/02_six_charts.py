import plotly.express as px
import pandas as pd

# Load the data once
df = pd.read_csv('https://raw.githubusercontent.com/plotly/datasets/master/gapminder_with_codes.csv')

# ========================================
# CHART 1: SCATTER - Relationships between variables
# ========================================
# Use when: You want to see correlation between 2 numeric variables
# Example: Does GDP correlate with life expectancy?

fig1 = px.scatter(
    df.query("year==2007"),    # Filter data for year 2007
    x='gdpPercap',              # X-axis: GDP per capita
    y='lifeExp',                # Y-axis: Life expectancy
    color='continent',          # Color points by continent
    size='pop',                 # Size points by population
    hover_name='country',       # Show country name on hover
    log_x=True,                 # Use log scale for better visualization
    title='GDP vs Life Expectancy (2007)'
)
fig1.show()

# ========================================
# CHART 2: LINE - Time series & trends
# ========================================
# Use when: Showing how something changes over time
# Example: How has Colombia's life expectancy evolved?

colombia = df[df['country']=='Colombia']  # Filter for Colombia only
fig2 = px.line(
    colombia,
    x='year',                   # X-axis: time
    y='lifeExp',                # Y-axis: life expectancy
    markers=True,               # Show points on the line
    title='Life Expectancy Evolution - Colombia'
)
fig2.show()

# ========================================
# CHART 3: BAR - Comparing categories
# ========================================
# Use when: Comparing values across different categories
# Example: Which countries have the largest populations?

top10 = df.query("year==2007").nlargest(10, 'pop')  # Get top 10 countries
fig3 = px.bar(
    top10,
    x='country',                # X-axis: country names
    y='pop',                    # Y-axis: population
    color='continent',          # Color bars by continent
    title='Top 10 Countries by Population (2007)'
)
fig3.show()

# ========================================
# CHART 4: BOX PLOT - Distribution comparison
# ========================================
# Use when: Comparing distributions across groups
# Example: How does life expectancy vary within each continent?

fig4 = px.box(
    df.query("year==2007"),
    x='continent',              # Groups on X-axis
    y='lifeExp',                # Distribution of this variable
    color='continent',          # Color by group
    title='Life Expectancy Distribution by Continent (2007)'
)
fig4.show()

# ========================================
# CHART 5: HISTOGRAM - Single variable distribution
# ========================================
# Use when: Understanding the distribution of one numeric variable
# Example: What's the distribution of life expectancy globally?

fig5 = px.histogram(
    df.query("year==2007"),
    x='lifeExp',                # Variable to analyze
    nbins=20,                   # Number of bins (bars)
    title='Global Life Expectancy Distribution (2007)'
)
fig5.show()

# ========================================
# CHART 6: TREEMAP - Hierarchical proportions
# ========================================
# Use when: Showing hierarchical data and proportions
# Example: How is world population distributed across continents and countries?

fig6 = px.treemap(
    df.query("year==2007"),
    path=[px.Constant("world"), 'continent', 'country'],  # Hierarchy levels
    values='pop',               # Size of rectangles
    title='World Population Distribution (2007)'
)
fig6.show()