# visualization

### run

```javascript
cd web/
npm i
mkdir assert  # dir for generating js css assert file
gulp

python -m SimpleHTTPServer  # simple static http server

cd ..
cd server/
python3 app.py  # run server
mkdir datas  # put json files here

# about json files
# example filename : 010116000950.json
#
# attention: all.json.bak is needed, use xlss_to_json.py scripts
#   to generate all.json, rename to all.json.bak
#
# generate other json file from all.json, you need to write a script 
#   by yourself
```
