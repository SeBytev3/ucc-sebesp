import plotly.express as px
import pandas as pd

df = pd.read_csv('https://raw.githubusercontent.com/plotly/datasets/master/gapminder_with_codes.csv')

# ANIMACIÓN TEMPORAL
fig = px.scatter(
    df, 
    x='gdpPercap', 
    y='lifeExp', 
    animation_frame='year',      # ← La magia está aquí
    animation_group='country',
    size='pop', 
    color='continent', 
    hover_name='country',
    log_x=True, 
    size_max=55, 
    range_x=[100, 100000], 
    range_y=[25, 90],
    title='Evolución del Desarrollo Global 1952-2007'
)

# Hacer la animación más lenta
fig.layout.updatemenus[0].buttons[0].args[1]['frame']['duration'] = 1000  # 1 segundo por frame

fig.show()