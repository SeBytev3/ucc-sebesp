import plotly.express as px
import pandas as pd

df = pd.read_csv('https://raw.githubusercontent.com/plotly/datasets/master/gapminder_with_codes.csv')
df_2007 = df[df['year']==2007]

# HOVER AVANZADO
fig = px.scatter(
    df_2007,
    x='gdpPercap',
    y='lifeExp',
    size='pop',
    color='continent',
    hover_name='country',  # nombre principal al pasar mouse
    hover_data={
        'gdpPercap': ':,.0f',    # formato con comas, sin decimales
        'lifeExp': ':.1f',       # 1 decimal
        'pop': ':,.0f',          # formato con comas
        'continent': False       # no mostrar (ya está en color)
    },
    title='Hover Personalizado'
)

# Template de hover personalizado
fig.update_traces(
    hovertemplate='<b>%{hovertext}</b><br><br>' +
                  'PIB: $%{x:,.0f}<br>' +
                  'Esperanza Vida: %{y:.1f} años<br>' +
                  'Población: %{marker.size:,.0f}<br>' +
                  '<extra></extra>'  # elimina info extra del lado
)

fig.show()