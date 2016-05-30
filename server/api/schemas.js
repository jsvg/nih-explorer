'use strict';

const schema = {
  grant: {
    activity: { type: String },
    administeringIc: { type: String },
    applicationType: { type: String },
    awardNoticeDate: { type: Date },
    budgetStart: { type: Date },
    budgetEnd: { type: Date },
    edInstType: { type: String },
    fundingIcs: { type: String },
    fundingMechanism: { type: String },
    fy: { type: Number },
    icName: { type: String },
    nihSpendingCats: { type: String },
    orgCity: { type: String },
    orgCountry: { type: String },
    orgDept: { type: String },
    orgDistrict: { type: String },
    orgDuns: { type: String },
    orgFips: { type: String },
    orgName: { type: String },
    orgState: { type: String },
    orgZip: { type: String },
    phr: { type: String },
    piIds: { type: String },
    piNames: { type: String },
    programOfficerName: { type: String },
    projectStart: { type: Date },
    projectEnd: { type: Date },
    projectTerms: { type: String },
    projectTitle: { type: String },
    studySection: { type: String },
    studySectionName: { type: String },
    supportYear: { type: Number },
    totalCost: { type: Number },
    activityType: { type: String }
  }
};

module.exports = schema;