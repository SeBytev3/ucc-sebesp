import plotly.express as px
import pandas as pd

# Load sample data from online dataset
# This is the famous Gapminder dataset with country development indicators
df = pd.read_csv('https://raw.githubusercontent.com/plotly/datasets/master/gapminder_with_codes.csv')

# YOUR FIRST INTERACTIVE CHART - Just 3 lines!
fig = px.scatter(
    df.query("year==2007"),      # Filter: only year 2007
    x='gdpPercap',                # X-axis: GDP per capita
    y='lifeExp',                  # Y-axis: Life expectancy
    size='pop',                   # Bubble size: population
    color='continent',            # Color: by continent
    hover_name='country',         # Show country name on hover
    log_x=True,                   # Logarithmic scale for X-axis
    size_max=60,                  # Maximum bubble size
    title='GDP vs Life Expectancy (2007)'
)

# Display the interactive chart
fig.show()