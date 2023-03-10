public without sharing class PropertyController {
  private static final Decimal DEFAULT_MAX_PRICE = 9999999;
  private static final Integer DEFAULT_PAGE_SIZE = 9;

  /**
   * Endpoint that retrieves a paged and filtered list of properties
   * @param searchKey String used for searching on property title, city and tags
   * @param recordType String for property record type
   * @param maxPrice Maximum price
   * @param minBedrooms Minimum number of bedrooms
   * @param minBathrooms Minimum number of bathrooms
   * @param minRating Minimum score (rating)
   * @param propsInDistance Properties in distance
   * @param mapMarkers Map markers for list map
   * @param pageSize Number of properties per page
   * @param pageNumber Page number
   * @param companies Determines which partners to include
   * @param filteringDistance Determines if distance should be filtered
   * @return PagedResult object holding the paged and filtered list of properties
   */
  @AuraEnabled(cacheable=true scope='global')
  public static PagedResult getPagedPropertyList(
    String searchKey,
    String recordType,
    Decimal maxPrice,
    Integer minBedrooms,
    Integer minBathrooms,
    Integer minRating,
    Id[] propsInDistance,
    Object[] mapMarkers,
    Integer pageSize,
    Integer pageNumber,
    List<String> companies,
    Boolean filteringDistance
  ) {
    // Normalize inputs
    Decimal safeMaxPrice = (maxPrice == null ? DEFAULT_MAX_PRICE : maxPrice);
    Integer safeMinBedrooms = (minBedrooms == null ? 0 : minBedrooms);
    Integer safeMinBathrooms = (minBathrooms == null ? 0 : minBathrooms);
    Integer safeMinRating = (minRating == null ? 0 : minRating);
    Integer safePageSize = (pageSize == null ? DEFAULT_PAGE_SIZE : pageSize);
    Integer safePageNumber = (pageNumber == null ? 1 : pageNumber);
    Boolean safeFilteringDistance = (filteringDistance == null ? false : filteringDistance);

    String searchPattern = '%' + searchKey + '%';
    Integer offset = (safePageNumber - 1) * safePageSize;

    PagedResult result = new PagedResult();
    result.pageSize = safePageSize;
    result.pageNumber = safePageNumber;
      
    String test = 'test';

    if (recordType != null && recordType != '' && recordType != 'Any') {
      if (safeFilteringDistance == true) {
        // VARIATION 1: Record Type Filter = YES, Distance Filter = YES
        result.totalItemCount = [
          SELECT COUNT()
          FROM Property__c
          WHERE
            (Name LIKE :searchPattern OR Billing_Street__c LIKE :searchPattern OR Billing_City__c LIKE :searchPattern OR Billing_State__c LIKE :searchPattern
            OR Billing_Postal_Code__c LIKE :searchPattern OR RecordType.Name LIKE :searchPattern) AND RecordType.Name = :recordType AND Rent__c <= :safeMaxPrice
            AND Bedrooms__c >= :safeMinBedrooms AND Bathrooms__c >= :safeMinBathrooms AND Score__c >= :safeMinRating AND Status__c = 'Available'
            AND Id IN :propsInDistance AND Approval_Status__c = 'Approved' AND Origin_Company__c IN :companies
        ];
        result.records = [
          SELECT
            Id, Billing_Street__c, Billing_City__c, Billing_State__c, Billing_Postal_Code__c, Billing_Country__c, Rent__c,
            Bathrooms__c, Bedrooms__c, Geolocation__Latitude__s, Geolocation__Longitude__s, Name, Picture__c, Score__c, Status__c, Approval_Status__c, Origin_Company__c
          FROM Property__c
          WHERE
            (Name LIKE :searchPattern OR Billing_Street__c LIKE :searchPattern OR Billing_City__c LIKE :searchPattern OR Billing_State__c LIKE :searchPattern
            OR Billing_Postal_Code__c LIKE :searchPattern OR RecordType.Name LIKE :searchPattern) AND RecordType.Name = :recordType AND Rent__c <= :safeMaxPrice
            AND Bedrooms__c >= :safeMinBedrooms AND Bathrooms__c >= :safeMinBathrooms AND Score__c >= :safeMinRating AND Status__c = 'Available'
            AND Id IN :propsInDistance AND Approval_Status__c = 'Approved' AND Origin_Company__c IN :companies
          WITH SECURITY_ENFORCED
          ORDER BY Rent__c
          LIMIT :safePageSize
          OFFSET :offset
        ];
      } else {
        // VARIATION 2: Record Type Filter = YES, Distance Filter = NO
        result.totalItemCount = [
          SELECT COUNT()
          FROM Property__c
          WHERE
            (Name LIKE :searchPattern OR Billing_Street__c LIKE :searchPattern OR Billing_City__c LIKE :searchPattern OR Billing_State__c LIKE :searchPattern
            OR Billing_Postal_Code__c LIKE :searchPattern OR RecordType.Name LIKE :searchPattern) AND RecordType.Name = :recordType AND Rent__c <= :safeMaxPrice
            AND Bedrooms__c >= :safeMinBedrooms AND Bathrooms__c >= :safeMinBathrooms AND Score__c >= :safeMinRating AND Status__c = 'Available' AND Approval_Status__c = 'Approved'
            AND Origin_Company__c IN :companies
        ];
        result.records = [
          SELECT
            Id, Billing_Street__c, Billing_City__c, Billing_State__c, Billing_Postal_Code__c, Billing_Country__c, Rent__c,
            Bathrooms__c, Bedrooms__c, Geolocation__Latitude__s, Geolocation__Longitude__s, Name, Picture__c, Score__c, Status__c, Approval_Status__c, Origin_Company__c
          FROM Property__c
          WHERE
            (Name LIKE :searchPattern OR Billing_Street__c LIKE :searchPattern OR Billing_City__c LIKE :searchPattern OR Billing_State__c LIKE :searchPattern
            OR Billing_Postal_Code__c LIKE :searchPattern OR RecordType.Name LIKE :searchPattern) AND RecordType.Name = :recordType AND Rent__c <= :safeMaxPrice
            AND Bedrooms__c >= :safeMinBedrooms AND Bathrooms__c >= :safeMinBathrooms AND Score__c >= :safeMinRating AND Status__c = 'Available' AND Approval_Status__c = 'Approved'
            AND Origin_Company__c IN :companies
          WITH SECURITY_ENFORCED
          ORDER BY Rent__c
          LIMIT :safePageSize
          OFFSET :offset
        ];
      }
    } else {
      if (safeFilteringDistance == true) {
        // VARIATION 3: Record Type Filter = NO, Distance Filter = YES
        result.totalItemCount = [
          SELECT COUNT()
          FROM Property__c
          WHERE
            (Name LIKE :searchPattern OR Billing_Street__c LIKE :searchPattern OR Billing_City__c LIKE :searchPattern OR Billing_State__c LIKE :searchPattern
            OR Billing_Postal_Code__c LIKE :searchPattern OR RecordType.Name LIKE :searchPattern) AND Rent__c <= :safeMaxPrice AND Bedrooms__c >= :safeMinBedrooms
            AND Bathrooms__c >= :safeMinBathrooms AND Score__c >= :safeMinRating AND Status__c = 'Available' AND Id IN :propsInDistance
            AND Approval_Status__c = 'Approved' AND Origin_Company__c IN :companies
        ];
        result.records = [
          SELECT
            Id, Billing_Street__c, Billing_City__c, Billing_State__c, Billing_Postal_Code__c, Billing_Country__c, Rent__c,
            Bathrooms__c, Bedrooms__c, Geolocation__Latitude__s, Geolocation__Longitude__s, Name, Picture__c, Score__c, Status__c, Approval_Status__c, Origin_Company__c
          FROM Property__c
          WHERE
            (Name LIKE :searchPattern OR Billing_Street__c LIKE :searchPattern OR Billing_City__c LIKE :searchPattern OR Billing_State__c LIKE :searchPattern
            OR Billing_Postal_Code__c LIKE :searchPattern OR RecordType.Name LIKE :searchPattern) AND Rent__c <= :safeMaxPrice AND Bedrooms__c >= :safeMinBedrooms
            AND Bathrooms__c >= :safeMinBathrooms AND Score__c >= :safeMinRating AND Status__c = 'Available' AND Id IN :propsInDistance
            AND Approval_Status__c = 'Approved' AND Origin_Company__c IN :companies
          WITH SECURITY_ENFORCED
          ORDER BY Rent__c
          LIMIT :safePageSize
          OFFSET :offset
        ];
      } else {
        // VARIATION 4: Record Type Filter = NO, Distance Filter = NO
        result.totalItemCount = [
          SELECT COUNT()
          FROM Property__c
          WHERE
            (Name LIKE :searchPattern OR Billing_Street__c LIKE :searchPattern OR Billing_City__c LIKE :searchPattern OR Billing_State__c LIKE :searchPattern
            OR Billing_Postal_Code__c LIKE :searchPattern OR RecordType.Name LIKE :searchPattern) AND Rent__c <= :safeMaxPrice AND Bedrooms__c >= :safeMinBedrooms
            AND Bathrooms__c >= :safeMinBathrooms AND Score__c >= :safeMinRating AND Status__c = 'Available' AND Approval_Status__c = 'Approved' AND Origin_Company__c IN :companies
        ];
        result.records = [
          SELECT
            Id, Billing_Street__c, Billing_City__c, Billing_State__c, Billing_Postal_Code__c, Billing_Country__c, Rent__c,
            Bathrooms__c, Bedrooms__c, Geolocation__Latitude__s, Geolocation__Longitude__s, Name, Picture__c, Score__c, Status__c, Approval_Status__c, Origin_Company__c
          FROM Property__c
          WHERE
            (Name LIKE :searchPattern OR Billing_Street__c LIKE :searchPattern OR Billing_City__c LIKE :searchPattern OR Billing_State__c LIKE :searchPattern
            OR Billing_Postal_Code__c LIKE :searchPattern OR RecordType.Name LIKE :searchPattern) AND Rent__c <= :safeMaxPrice AND Bedrooms__c >= :safeMinBedrooms
            AND Bathrooms__c >= :safeMinBathrooms AND Score__c >= :safeMinRating AND Status__c = 'Available' AND Approval_Status__c = 'Approved' AND Origin_Company__c IN :companies
          WITH SECURITY_ENFORCED
          ORDER BY Rent__c
          LIMIT :safePageSize
          OFFSET :offset
        ];
      }
    }

    return result;
  }

  /**
   * Endpoint that retrieves pictures associated with a property
   * @param propertyId Property Id
   * @return List of ContentVersion holding the pictures
   */
  @AuraEnabled(cacheable=true scope='global')
  public static List<ContentVersion> getPictures(Id propertyId) {
    List<ContentDocumentLink> links = [
      SELECT Id, LinkedEntityId, ContentDocumentId
      FROM ContentDocumentLink
      WHERE
        LinkedEntityId = :propertyId
        AND ContentDocument.FileType IN ('PNG', 'JPG', 'GIF')
      WITH SECURITY_ENFORCED
    ];

    if (links.isEmpty()) {
      return null;
    }

    Set<Id> contentIds = new Set<Id>();

    for (ContentDocumentLink link : links) {
      contentIds.add(link.ContentDocumentId);
    }

    return [
      SELECT Id, Title
      FROM ContentVersion
      WHERE ContentDocumentId IN :contentIds AND IsLatest = TRUE
      WITH SECURITY_ENFORCED
      ORDER BY CreatedDate
    ];
  }
    
    // For submitting a new property, image included
    @AuraEnabled
    public static string newProperty(Property__c propRec, String file, String fileName) {
        String propertyId;
        try {
            insert propRec;
            propertyId = propRec.Id;
            String base64File = EncodingUtil.urlDecode(file, 'UTF-8');
            ContentVersion contentVersionRec = new ContentVersion();
            contentVersionRec.Title = fileName;
            contentVersionRec.PathOnClient = '/' + fileName;
            contentVersionRec.FirstPublishLocationId = propRec.Id;
            contentVersionRec.VersionData = EncodingUtil.base64Decode(base64File);
            contentVersionRec.IsMajorVersion = true;
            insert contentVersionRec;
        } catch (Exception e) {
            System.debug('File: ' + file);
            System.debug('FileName: ' + fileName);
            System.debug('Exception: ' + e.getMessage());
            // return e.getMessage();
            throw new AuraHandledException(e.getMessage());
        }
        return propertyId;
    }
}