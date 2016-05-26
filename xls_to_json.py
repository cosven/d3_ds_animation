#!/usr/bin/env python3

import os
import json

import xlrd


DIRNAME = 'datas/'


def get_files():
    fs = os.listdir(DIRNAME)
    for f in fs:
        if not f.endswith('.xls'):
            fs.remove(f)
    return fs


def xls_to_json(f_path):
    print('accessing %s' % f_path)
    xl_workbook = xlrd.open_workbook(f_path)
    sheet_name = xl_workbook.sheet_names()[0]
    sheet = xl_workbook.sheet_by_name(sheet_name)
    records = []
    device_id = 0
    for row in sheet.get_rows():
        text = row[0].value
        sys_module = row[1].value
        rec_type = row[2].value
        timestamp = row[3].value
        did = row[4].value
        device_id = did
        d = dict(asr_text=text, module=sys_module, rec_type=rec_type,
                 timestamp=timestamp)
        records.append(d)
    return dict(records=records, did=device_id)


def main():
    files = get_files()
    print('detect %d xls files' % len(files))
    for f in files:
        print('accessing %s ....' % f)
        f_path = DIRNAME + f
        d = xls_to_json(f_path)
        f_json = DIRNAME + f.split('.')[0] + '.json'
        with open(f_json, 'w') as f_j:
            json.dump(d, f_j, indent=4)

    print('finished...')


if __name__ == '__main__':
    main()
