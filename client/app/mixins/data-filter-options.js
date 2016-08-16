/**
 * Mixin that provides necessary variables to allow for 
 * filtering on data elements; use mixin in controller to
 * automatically setup query params
 */
import Mixin from 'ember-metal/mixin';
export default Mixin.create({
  /**
   * This will eventually will be offloaded to the server
   * where it can be stored/cached on a user-dependent basis,
   * which will require POSTing HTTP requests
   */
  baseFilterSet: [
    // default set (activated true at startup)
    {
      filterTitle: 'Funding Mechanism',
      activated: true,
      resource: 'grants',
      filterAttr: 'fundingMechanism',
      placeholder: 'Select funding mechanism',
      itemFormat: 'title'
    },
    {
      filterTitle: 'Activity Code',
      activated: true,
      resource: 'grants',
      filterAttr: 'activity',
      placeholder: 'Select activity code',
      itemFormat: 'upper'
    },
    {
      filterTitle: 'Administering I/C',
      activated: true,
      resource: 'grants',
      filterAttr: 'icName',
      placeholder: 'Select I/C',
      itemFormat: 'title'
    },
    {
      filterTitle: 'Organization Country',
      activated: true,
      resource: 'grants',
      filterAttr: 'orgCountry',
      placeholder: 'Select organization country',
      itemFormat: 'title'
    },
    {
      filterTitle: 'NIH Spending Category (RCDC)',
      activated: true,
      resource: 'grants',
      filterAttr: 'nihSpendingCats',
      placeholder: 'Select an RCDC code',
      itemFormat: 'title'
    },
    // optional (activated false at start)
    {
      filterTitle: 'Application Type',
      activated: false,
      resource: 'grants',
      filterAttr: 'applicationType',
      placeholder: 'Select an application type'
    },
    {
      filterTitle: 'Organization Type',
      activated: false,
      resource: 'grants',
      filterAttr: 'edInstType',
      placeholder: 'Select and educational org type',
      itemFormat: 'title'
    },
    {
      filterTitle: 'Core Project Number',
      activated: false,
      resource: 'grants',
      filterAttr: 'coreProjectNum',
      placeholder: 'Select a core project number',
      itemFormat: 'upper'
    },
    {
      filterTitle: 'Program Officer Name',
      activated: false,
      resource: 'grants',
      filterAttr: 'programOfficerName',
      placeholder: 'Select a program officer name',
      itemFormat: 'title'
    },
    {
      filterTitle: 'PI Name',
      activated: false,
      resource: 'grants',
      filterAttr: 'piNames',
      placeholder: 'Select a PI name',
      itemFormat: 'title'
    },
    {
      filterTitle: 'Organization Department',
      activated: false,
      resource: 'grants',
      filterAttr: 'orgDept',
      placeholder: 'Select an organization department',
      itemFormat: 'title'
    },
    {
      filterTitle: 'Organization State',
      activated: false,
      resource: 'grants',
      filterAttr: 'orgState',
      placeholder: 'Select an organization state',
      itemFormat: 'upper'
    },
    {
      filterTitle: 'Organization Name',
      activated: false,
      resource: 'grants',
      filterAttr: 'orgName',
      placeholder: 'Select an organization',
      itemFormat: 'title'
    }
  ]
});
