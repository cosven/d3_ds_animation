import json
import os
import random

from flask import Blueprint, request
from flask_restful import Api, Resource

from .xls_to_json import xls_to_json

apiv1 = Blueprint('apiv1', __name__)
api = Api(apiv1)


DATA_DIR = os.path.join(os.path.dirname(__file__), '../datas/')


class User(Resource):
    def get(self, uid):
        try:
            f_path = DATA_DIR + uid + '.json'
            with open(f_path) as f:
                data = json.load(f)
        except:
            data = {}
        return {'uid': uid,
                'data': data}


class Users(Resource):
    def get(self):
        a_random = request.args.get('random')
        if a_random:
            return self.get_random_users()
        range_arg = request.args.get('choices')
        if range_arg == 'all':
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
        all_data = self.get_all_users()
        uids = list(all_data.keys())
        result = {}
        for i in range(0, 20):
            uid = random.choice(uids)
            uids.remove(uid)
            if (len(all_data[uid]) == 0):
                continue
            result[uid] = all_data[uid]
        return result

    def get_all_users(self):
        with open(DATA_DIR + 'all.json.bak') as f:
            data = json.load(f)
        return data


class UserList(Resource):
    def get(self):
        fs = os.listdir(DATA_DIR)
        return [x[:-5] for x in fs if x.endswith('.json')]


api.add_resource(User, '/user/<uid>')
api.add_resource(Users, '/users')
api.add_resource(UserList, '/userlist')
