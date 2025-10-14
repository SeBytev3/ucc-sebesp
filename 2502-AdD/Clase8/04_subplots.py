from plotly.subplots import make_subplots
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd

df = pd.read_csv('https://raw.githubusercontent.com/plotly/datasets/master/gapminder_with_codes.csv')

# Crear grid 2x2
fig = make_subplots(
    rows=2, cols=2,
    subplot_titles=(
        'PIB vs Esperanza de Vida', 
        'Evolución Colombia', 
        'Distribución Esperanza de Vida', 
        'Top 10 Países por Población'
    ),
    specs=[
        [{'type': 'scatter'}, {'type': 'scatter'}],
        [{'type': 'histogram'}, {'type': 'bar'}]
    ]
)

# Preparar datos
df_2007 = df[df['year']==2007]
df_col = df[df['country']=='Colombia']
top10 = df_2007.nlargest(10, 'pop')

# Subplot 1: Scatter (fila 1, columna 1)
fig.add_trace(
    go.Scatter(
        x=df_2007['gdpPercap'], 
        y=df_2007['lifeExp'],
        mode='markers', 
        name='2007',
        marker=dict(size=8, color='blue')
    ),
    row=1, col=1
)

# Subplot 2: Line (fila 1, columna 2)
fig.add_trace(
    go.Scatter(
        x=df_col['year'], 
        y=df_col['lifeExp'],
        mode='lines+markers', 
        name='Colombia',
        line=dict(color='green', width=3)
    ),
    row=1, col=2
)

# Subplot 3: Histogram (fila 2, columna 1)
fig.add_trace(
    go.Histogram(
        x=df_2007['lifeExp'], 
        name='Distribución',
        marker=dict(color='orange')
    ),
    row=2, col=1
)

# Subplot 4: Bar (fila 2, columna 2)
fig.add_trace(
    go.Bar(
        x=top10['country'], 
        y=top10['pop'], 
        name='Top 10',
        marker=dict(color='red')
    ),
    row=2, col=2
)

# Layout general
fig.update_layout(
    height=800,
    showlegend=False,
    title_text='Dashboard Multivista - Gapminder 2007'
)

fig.show()