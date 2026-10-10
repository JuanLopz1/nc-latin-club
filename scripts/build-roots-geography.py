"""Build public-domain globe geometry from the two Natural Earth GeoJSON files.
Usage: python3 scripts/build-roots-geography.py PATH_TO_NE_50M PATH_TO_NE_10M
Source URLs, license and rebuild notes: docs/EXPLORE_ROOTS_DELIVERY.md.
"""
import json
import sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
world = json.loads(Path(sys.argv[1]).read_text())
units = json.loads(Path(sys.argv[2]).read_text())
countries = json.loads((ROOT / 'app/components/explore/countries.json').read_text())

def simplify(points, tolerance=.045):
    if len(points) < 5:
        return points
    first, last = points[0], points[-1]
    dx, dy = last[0]-first[0], last[1]-first[1]
    den = dx*dx+dy*dy
    best, index = -1, 0
    for i, p in enumerate(points[1:-1], 1):
        t = max(0, min(1, ((p[0]-first[0])*dx+(p[1]-first[1])*dy)/den)) if den else 0
        distance = (p[0]-first[0]-t*dx)**2+(p[1]-first[1]-t*dy)**2
        if distance > best:
            best, index = distance, i
    if best > tolerance*tolerance:
        return simplify(points[:index+1], tolerance)[:-1]+simplify(points[index:], tolerance)
    return [first, last]

def orientation(ring):
    return sum(a[0]*b[1]-b[0]*a[1] for a,b in zip(ring,ring[1:]))

def ring(source, tolerance=.045):
    reduced = simplify(source, tolerance)
    if len(reduced) < 4:
        reduced = source
    rounded = [[round(p[0], 4), round(p[1], 4)] for p in reduced]
    # A thin curved island can flip winding during simplification. Retain the
    # original instead of painting the complement of its spherical polygon.
    return source if orientation(source)*orientation(rounded) <= 0 else rounded

def geometry(source, tolerance=.045):
    coordinates = source['coordinates']
    if source['type'] == 'Polygon':
        coordinates = [ring(r,tolerance) for r in coordinates]
    else:
        coordinates = [[ring(r,tolerance) for r in p] for p in coordinates]
    return {'type':source['type'], 'coordinates':coordinates}

features = []
for feature in world['features']:
    p = feature['properties']
    iso = p['ISO_A2_EH'] if p['ISO_A2'] == '-99' else p['ISO_A2']
    g = feature['geometry']
    if iso == 'FR':
        # These overseas components are rendered separately below. Avoid
        # overlapping country/territory meshes and selecting France instead.
        coordinates = [poly for poly in g['coordinates'] if not (poly[0][0][0] < -40 and poly[0][0][1] < 30)]
        g = {'type':'MultiPolygon','coordinates':coordinates}
    features.append({'type':'Feature','properties':{'iso2':iso,'name':p['NAME_EN'],'americas':p['CONTINENT'] in ['North America','South America']},'geometry':geometry(g)})
for c in countries:
    if c['iso2'] not in ['GF','GP','MQ','BQ']:
        continue
    source = next(f for f in units['features'] if (f['properties']['GU_A3'] == 'NLY' if c['iso2']=='BQ' else f['properties']['ISO_A2_EH'] == c['iso2']))
    g = source['geometry']
    if c['iso2'] == 'BQ':
        # Select the actual island by its source-derived geographic bounds;
        # all three islands share ISO BQ, but have independent cultural slugs.
        lat, lng = c['center']['lat'], c['center']['lng']
        poly = next(p for p in g['coordinates'] if min(v[0] for v in p[0]) <= lng <= max(v[0] for v in p[0]) and min(v[1] for v in p[0]) <= lat <= max(v[1] for v in p[0]))
        g = {'type':'Polygon','coordinates':poly}
    features.append({'type':'Feature','properties':{'iso2':c['iso2'],'slug':c['slug'],'name':c['name']['en'],'americas':True},'geometry':geometry(g,.005)})
output = {'type':'FeatureCollection','sources':['https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_50m_admin_0_countries.geojson','https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_admin_0_map_units.geojson'],'license':'Public domain — Natural Earth','features':features}
path = ROOT / 'public/data/roots-world.geojson'
path.write_text(json.dumps(output,separators=(',',':')))
print(f'{len(features)} features; {path.stat().st_size} bytes')
