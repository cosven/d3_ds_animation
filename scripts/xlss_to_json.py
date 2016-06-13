#!/usr/bin/env python3

'''
python dependency: pip install xlrd

run howto:
1. put all xls data into current directory
2. run this script with python2 or python3
'''


import os
import json
import random

import xlrd


DIRNAME = './'
JSONNAME = 'all.json'
RANDOM_JSONNAME = 'random.json'


def get_files():
    fs = os.listdir(DIRNAME)
    return (x for x in fs if x.endswith('.xls'))


def xls_to_json(f_path, test_ids=[]):
    '''single xls to single json'''
    xl_workbook = xlrd.open_workbook(f_path)
    sheet_name = xl_workbook.sheet_names()[0]
    sheet = xl_workbook.sheet_by_name(sheet_name)
    users_data = {}

    ignore_count = 0
    for row in sheet.get_rows():
        did = row[4].value
        if (did in test_ids) or (not did):
            ignore_count += 1
            continue

        text = row[0].value
        sys_module = row[1].value
        rec_type = row[2].value
        timestamp = row[3].value
        d = dict(asr_text=text, module=sys_module, rec_type=rec_type,
                 timestamp=timestamp)
        if users_data.get(did) is None:
            users_data[did] = []
            users_data[did].append(d)
        else:
            users_data[did].append(d)
    print('ignore %d log item in %s' % (ignore_count, f_path))
    return users_data


def get_test_ids():
    print('get test ids .........')
    test_ids = []
    with open('test_id.txt') as f:
        i = 0
        while(True):
            line = f.readline()
            if not line:
                break
            try:
                d = json.loads(line[0:-1])
            except:
                print('lineno:%d this line has no id info' % i)
                continue

            test_id = d['_id']
            test_ids.append(test_id)
            i += 1

        print('total %d test id' % i)
    print('get test ids finished .........')
    return test_ids


def combine(week1, week2):
    '''combine two period data into one'''
    print('combining...')
    for k, v in week2.items():
        if k in week1:
            week1[k].extend(v)
        else:
            week1[k] = v
    return week1


def choose(num=20):
    '''random choose num device log data from all'''
    num = 30 if num > 30 else num
    print('will random choose %d from all' % num)
    result = {}
    with open(JSONNAME) as f:
        users_data = json.load(f)
        uids = list(users_data.keys())
        for i in range(0, num):
            uid = random.choice(uids)
            print('random choose %s did' % uid)
            uids.remove(uid)
            result[uid] = users_data[uid]

    with open(RANDOM_JSONNAME, 'w') as f:
        json.dump(result, f, indent=4)

    print('save random logs to %s' % RANDOM_JSONNAME)


def main():
    files = get_files()
    test_ids = get_test_ids()
    result = {}
    for f in files:
        print('accessing %s ....' % f)
        f_path = DIRNAME + f
        d = xls_to_json(f_path, test_ids)
        result = combine(result, d)

    with open(JSONNAME, 'w') as f:
        json.dump(result, f, indent=4)

    choose(20)

    print('finished...')


if __name__ == '__main__':
    main()
    choose(20)
