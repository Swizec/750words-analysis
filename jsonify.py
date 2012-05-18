
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

    def word(d, w):
        d[w] = d['entry'].count(w)
        return d

    bad = get_dict('badwords.txt')
    happy = get_dict('happy.txt')
    sad = get_dict('sad.txt')
    food = get_dict('food.txt')

    data = map(lambda e: counts(e, 'bad_words', bad), data)
    data = map(lambda e: counts(e, 'happy_words', happy), data)
    data = map(lambda e: counts(e, 'sad_words', sad), data)
    data = map(lambda e: counts(e, 'food_words', food), data)
    data = map(lambda d: word(d, 'sex'), data)
    data = map(lambda d: word(d, 'tea'), data)

    return data

def finalize(e):
    return {'date': e['date'],
            'words': int(e['words']),
            'minutes': float(e['minutes']),
            'bad_words': int(e['bad_words']),
            'happy_words': int(e['happy_words']),
            'sad_words': int(e['sad_words']),
            'sex_words': int(e['sex']),
            'food_words': int(e['food_words']),
            'tea_words': int(e['tea'])}

if __name__ == "__main__":
    data = sorted(
        flatten(map(parse,
                    (f for f in os.listdir(".") if f.endswith('.txt')))),
        key=lambda x: datetime.strptime(x['date'], '%Y-%m-%d'))

    data = word_counts(data)
    data = map(finalize, data)

    open('data.js', 'w').write('var DATA = '+json.dumps(data)+';')
