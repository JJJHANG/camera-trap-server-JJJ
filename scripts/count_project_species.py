from taicat.models import *
from django.db import connection
import pandas as pd
from django.utils import timezone
import collections
from operator import itemgetter

ret = {}
for p in Project.objects.all():
    img_list = Image.objects.values_list(
        'annotation', flat=True).filter(project_id=p).all()
    project_species_list = []
    for alist in img_list:
        for a in alist:
            try:
                if sp := a.get('species', ''):
                    project_species_list.append(sp)
            except:
                #print ('annotation load error')
                pass
    counter = collections.Counter(project_species_list)
    counter_dict = dict(counter)
    project_species_list = sorted(
        counter_dict.items(), key=itemgetter(1), reverse=True)
    ret[p.id] = project_species_list


# save to project model
now = timezone.now()
for i in ret.keys():
    print(i)
    sp_list = ret[i]
    for j in sp_list:
        # print(j[0], j[1])
        ProjectSpecies(
            project_id=i,
            name=j[0],
            count=j[1],
            last_updated=now,
        )
