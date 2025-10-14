import plotly.graph_objects as go
import pandas as pd

df = pd.read_csv('https://raw.githubusercontent.com/plotly/datasets/master/gapminder_with_codes.csv')
df_2007 = df.query("year==2007 & continent=='Americas'")

fig = go.Figure()

# Agregar múltiples traces (uno por cada métrica)
metricas = ['lifeExp', 'gdpPercap', 'pop']
nombres = ['Esperanza de Vida', 'PIB per Cápita', 'Población']

for i, (metrica, nombre) in enumerate(zip(metricas, nombres)):
    fig.add_trace(go.Bar(
        x=df_2007['country'],
        y=df_2007[metrica],
        name=nombre,
        visible=(i == 0)  # Solo el primero visible
    ))

# Crear dropdown
buttons = []
for i, nombre in enumerate(nombres):
    visible = [False] * len(nombres)
    visible[i] = True
    
    buttons.append(dict(
        label=nombre,
        method="update",
        args=[
            {"visible": visible},
            {"title": f"{nombre} por País - Américas 2007"}
        ]
    ))

fig.update_layout(
    updatemenus=[dict(
        active=0,
        buttons=buttons,
        direction="down",
        showactive=True,
        x=0.1,
        y=1.15
    )],
    title='Esperanza de Vida por País - Américas 2007',
    height=600
)

fig.show()