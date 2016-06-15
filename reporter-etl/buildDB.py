# coding: utf-8

# Connect to database, make loading function
from pymongo import MongoClient
import pandas as pd
client = MongoClient()
local = MongoClient("mongodb://localhost:27017").reporter


# Loading convenience function
def loadDF(df, collectionName, db, dropFirst=True):
    if dropFirst:
        db[collectionName].drop()
    db[collectionName].insert_many(df.to_dict(orient='records'))
    print 'Successfully loaded:', collectionName


# Get dfs ready for transformation and loading
# etl for just fy15 (data only included for this)
df15links = pd.read_excel('RePORTER_PUBLNK_C_2015.xlsx')
df15pubs = pd.read_excel('RePORTER_PUB_C_2015.xlsx')
df15grants = pd.read_excel('RePORTER_PRJ_C_FY2015.xlsx')\
    .drop(['DIRECT_COST_AMT', 'INDIRECT_COST_AMT'], axis=1)
dfLinks = df15links.copy()
dfPubs = df15pubs.copy()
df = df15grants.copy()
print 'DFs loaded'

# Grants model: Non-referential, compound doc approach

# loading PMID relationships
grantsLinkTable = dfLinks\
    .groupby('PROJECT_NUMBER')\
    .agg(lambda pId: pId.tolist())
df = df.merge(grantsLinkTable, how='left', left_on='CORE_PROJECT_NUM', right_index=True)

cols = {
    'APPLICATION_ID': '_id',
    'ACTIVITY': 'activity',
    'ADMINISTERING_IC': 'administeringIc',
    'APPLICATION_TYPE': 'applicationType',
    'AWARD_NOTICE_DATE': 'awardNoticeDate',
    'BUDGET_START': 'budgetStart',
    'BUDGET_END': 'budgetEnd',
    'CORE_PROJECT_NUM': 'coreProjectNum',
    'ED_INST_TYPE': 'edInstType',
    'FUNDING_ICs': 'fundingIcs',
    'FUNDING_MECHANISM': 'fundingMechanism',
    'FY': 'fy',
    'IC_NAME': 'icName',
    'NIH_SPENDING_CATS': 'nihSpendingCats',
    'ORG_CITY': 'orgCity',
    'ORG_COUNTRY': 'orgCountry',
    'ORG_DEPT': 'orgDept',
    'ORG_DISTRICT': 'orgDistrict',
    'ORG_DUNS': 'orgDuns',
    'ORG_FIPS': 'orgFips',
    'ORG_NAME': 'orgName',
    'ORG_STATE': 'orgState',
    'ORG_ZIPCODE': 'orgZip',
    'PHR': 'phr',
    'PI_IDS': 'piIds',
    'PI_NAMEs': 'piNames',
    'PROGRAM_OFFICER_NAME': 'programOfficerName',
    'PROJECT_START': 'projectStart',
    'PROJECT_END': 'projectEnd',
    'PROJECT_TERMS': 'projectTerms',
    'PROJECT_TITLE': 'projectTitle',
    'STUDY_SECTION': 'studySection',
    'STUDY_SECTION_NAME': 'studySectionName',
    'SUPPORT_YEAR': 'supportYear',
    'TOTAL_COST': 'totalCost',
    'PMID': 'publications'
}

dropCols = [
    'ARRA_FUNDED',
    'CFDA_CODE',
    'FOA_NUMBER',
    'FULL_PROJECT_NUM',
    'SERIAL_NUMBER',
    'SUFFIX',
    'SUBPROJECT_ID',
    'TOTAL_COST_SUB_PROJECT'
]


# drop subprojects
# rename columns to JSONAPI style
# drop ID-like cols
# fill NaT type since mongo can't handle that
df = df[df.TOTAL_COST.notnull()]\
    .rename(columns=cols)\
    .drop(dropCols, axis=1)\
    .fillna('')

# create activity type column with first letter of activity code
df['activityType'] = df.activity.apply(lambda i: str(i)[0] if i else '')


# parse the IC names and costs into an array
def fundingSplitter(icArray):
    icArray = str(icArray).split('''\\''')
    extractedICs = []
    for ic in icArray:
        if ic:
            tmp = ic.split(''':''')
            icName = tmp[0] if tmp[0] else ''
            cost = tmp[1] if len(tmp) > 1 else 0
            extractedICs.append({'ic': icName, 'cost': cost})
    return extractedICs
df['fundingIcs'] = df.fundingIcs.apply(fundingSplitter)


def termSplitter(arr):
    terms = str(arr).split(';') if not pd.isnull(arr) else []
    return [term.lower().strip() for term in terms]
df['nihSpendingCats'] = df.nihSpendingCats\
    .map(termSplitter)
df['projectTerms'] = df.projectTerms\
    .map(termSplitter)
df['piIds'] = df.piIds\
    .map(lambda name: name.encode('utf-8'))\
    .map(termSplitter)
df['piNames'] = df.piNames\
    .map(lambda name: name.encode('utf-8'))\
    .map(termSplitter)

# fix timestamp issues w pymongo serializing improperly
timecols = ['awardNoticeDate', 'budgetStart', 'budgetEnd', 'projectStart', 'projectEnd']
df.loc[:, timecols] = df.loc[:, timecols]\
    .apply(lambda col: pd.to_datetime(col, errors='coerce'))


# remap "" values in pubs to []
def reMapEmptyPubIds(pubIds):
    if pubIds == "":
        return []
    else:
        return pubIds
df['publications'] = df.publications.map(reMapEmptyPubIds)

print 'Prepped to load grant - df shape', df.shape
loadDF(df.fillna(''), 'grant', local)

print 'Creating grant index'
# create weighted index
local.grant.create_index([('$**', 'text')], weights={
    'projectTerms': 15,
    'projectTitle': 10,
    'nihSpendingCats': 10,
    'icName': 5,
    'orgName': 5,
    'phr': 2
})
print 'Created'

# Pubs model: Non-referential, compound doc approach
dfGrantLink = df.groupby('coreProjectNum')['_id'].agg(lambda x: x.tolist())

dfLinks = dfLinks\
    .merge(dfGrantLink.reset_index(), how='left', left_on='PROJECT_NUMBER', right_on='coreProjectNum')\
    .drop('coreProjectNum', axis=1)\
    .rename(columns={0: 'projects'})


def projectArrayMaker(arrays):
    tmp = []
    for r in arrays:
        if type(r) == list:
            [tmp.append(i) for i in r]
    return tmp
pubsLinkTable = dfLinks.groupby('PMID')['projects'].agg(projectArrayMaker)

dfPubs = dfPubs.merge(pubsLinkTable.reset_index(), how='left', on='PMID')

pubCols = {
    'AFFILIATION': 'affiliation',
    'AUTHOR_LIST': 'authors',
    'COUNTRY': 'country',
    'ISSN': 'issn',
    'JOURNAL_ISSUE': 'journalIssue',
    'JOURNAL_TITLE': 'journal',
    'JOURNAL_TITLE_ABBR': 'journalAbbr',
    'JOURNAL_VOLUME': 'journalVol',
    'LANG': 'lang',
    'PAGE_NUMBER': 'page',
    'PMC_ID': 'pmcId',
    'PMID': '_id',
    'PUB_DATE': 'pubDate',
    'PUB_TITLE': 'title',
    'PUB_YEAR': 'pubYear',
}

dfPubs = dfPubs    .rename(columns=pubCols)    .fillna('')

dfPubs['authors'] = dfPubs.authors\
    .map(lambda x: x.encode('utf-8'))\
    .map(termSplitter)

dfPubs['issn'] = dfPubs.issn.map(str)
dfPubs = dfPubs.drop('page', axis=1)

# across FY10-FY15, there is one duplicate
dfPubs = dfPubs.drop_duplicates('_id')

print 'Prepped to load publications - dfPubs shape', dfPubs.shape
loadDF(dfPubs, 'publication', local)

# create weighted index
print 'Creating pubs index'
local.publication.create_index([('$**', 'text')], weights={
    'title': 15,
    'journal': 10,
    'journalAbbr': 10,
    'author': 5
})
print 'Created'

print 'ETL Complete'
