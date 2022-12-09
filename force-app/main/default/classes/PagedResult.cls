public without sharing class PagedResult {
  @AuraEnabled
  public Integer pageSize { get; set; }

  @AuraEnabled
  public Integer pageNumber { get; set; }

  @AuraEnabled
  public Integer totalItemCount { get; set; }

  @AuraEnabled
  public Object[] records { get; set; }

  @AuraEnabled
  public Object[] mapMarkers { get; set; }
}