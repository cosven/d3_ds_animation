import os
import json

from flask import Blueprint, request
from flask_restful import Api, Resource

from .xls_to_json import xls_to_json

apiv1 = Blueprint('apiv1', __name__)
api = Api(apiv1)


DATA_DIR = os.path.join(os.path.dirname(__file__), '../datas/')


class User(Resource):
    def get(self, uid):
        try:
            f_path = DATA_DIR + 'speech_log－' + uid + '.xls'
            data = xls_to_json(f_path)
        except:
            data = {}
        return {'uid': uid,
                'data': data}


class Users(Resource):
    def get(self):
        random = request.args.get('random')
        if random:
            return self.get_random_users()
        uids = request.args.get('uid').split(',')
        result = []
        for uid in uids:
            f_path = DATA_DIR + 'speech_log－' + uid + '.xls'
            try:
                data = xls_to_json(f_path)
                result.append(dict(uid=uid, data=data))
            except:
                print('no user %s data' % uid)
                continue
        return result

    def get_random_users(self):
        with open(DATA_DIR + 'random.json') as f:
            data = json.load(f)
        return data


class UserList(Resource):
    def get(self):
        fs = os.listdir(DATA_DIR)
        return [x[-16:-4] for x in fs if x.endswith('.xls')]


api.add_resource(User, '/user/<uid>')
api.add_resource(Users, '/users')
api.add_resource(UserList, '/userlist')
