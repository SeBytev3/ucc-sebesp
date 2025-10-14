from plotly.subplots import make_subplots
import plotly.graph_objects as go
import pandas as pd

df = pd.read_csv('https://raw.githubusercontent.com/plotly/datasets/master/gapminder_with_codes.csv')
df_2007 = df[df['year']==2007]
top10 = df_2007.nlargest(10, 'pop')

fig = make_subplots(
    rows=2, cols=2, 
    subplot_titles=('Scatter', 'Line', 'Bar', 'Box')
)

# Scatter
fig.add_trace(
    go.Scatter(x=df_2007['gdpPercap'], y=df_2007['lifeExp'], mode='markers'), 
    row=1, col=1
)

# Line
colombia = df[df['country']=='Colombia']
fig.add_trace(
    go.Scatter(x=colombia['year'], y=colombia['lifeExp'], mode='lines'), 
    row=1, col=2
)

# Bar
fig.add_trace(
    go.Bar(x=top10['country'], y=top10['pop']), 
    row=2, col=1
)

# Box
fig.add_trace(
    go.Box(x=df_2007['continent'], y=df_2007['lifeExp']), 
    row=2, col=2
)

fig.update_layout(height=600, showlegend=False)
fig.show()