from flask import Flask
from api import apiv1
from flask_cors import CORS


app = Flask(__name__, static_url_path='/web')
cors = CORS(app, resources={r'/api/*': {'origin': '*'}})

# use blueprint which make app easy to test and exntend
app.register_blueprint(apiv1, url_prefix='/api/v1')


if __name__ == '__main__':
    app.run('0.0.0.0', debug=True)
