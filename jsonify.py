
import os
from datetime import datetime
import re
import json
from itertools import chain
import subprocess
from rid import RegressiveImageryDictionary, DEFAULT_RID_DICTIONARY, DEFAULT_RID_EXCLUSION_LIST

def flatten(listOfLists):
    "Flatten one level of nesting"
    return chain.from_iterable(listOfLists)

def parse(path):
    entries = []

    meta = re.compile('##### ENTRY ##### (\d+-\d+-\d+), num_words:(\d+), num_minutes:([0-9.]+)')

    print path

    for line in open(path):
        if line.startswith("##### ENTRY #####"):

            d, w, m = meta.match(line).groups()
            entries.append({'date': d,
                            'words': w,
                            'minutes': m,
                            'entry': ""})

        else:
            entries[-1]['entry'] += line

    return entries

def words(entry):
    words = entry.split()

    return filter(lambda w: len(w) > 0,
                  (w.strip("0123456789!:,.?(){}[]") for w in words))

def word_counts(data):
    def get_dict(path):
        d = {}
        for w in open('dicts/'+path).readlines():
            w = w.strip()
            if len(w) > 0:
                d[w.lower()] = True
        return d

    def counts(e,label, D):
        e[label] = sum(1 for w in words(e['entry']) if D.has_key(w.strip().lower()))
        return e

    def sex(d):
        d['sex'] = d['entry'].count('sex')
        return d

    bad = get_dict('badwords.txt')
    happy = get_dict('happy.txt')
    sad = get_dict('sad.txt')

    data = map(lambda e: counts(e, 'bad_words', bad), data)
    data = map(lambda e: counts(e, 'happy_words', happy), data)
    data = map(lambda e: counts(e, 'sad_words', sad), data)
    data = map(sex, data)

    return data

def finalize(e):
    return {'date': e['date'],
            'words': e['words'],
            'minutes': e['minutes'],
            'bad_words': e['bad_words'],
            'happy_words': e['happy_words'],
            'sad_words': e['sad_words'],
            'sex_words': e['sex']}

if __name__ == "__main__":
    data = sorted(
        flatten(map(parse,
                    (f for f in os.listdir(".") if f.endswith('.txt')))),
        key=lambda x: datetime.strptime(x['date'], '%Y-%m-%d'))

    data = word_counts(data)
    data = map(finalize, data)

    open('data.js', 'w').write('var DATA = '+json.dumps(data)+';')
