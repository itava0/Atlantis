public class FindSchoolsJson {
	// NOTE: This whole class has been deprecated by the Modal Map component and classes, but I'm keeping it
	// up as a reference for API queries and storing that information
    
	public class Private_Z {
		public List<Schools> schools {get;set;} 
		public Integer total {get;set;}

		public Private_Z(JSONParser parser) {
			while (parser.nextToken() != System.JSONToken.END_OBJECT) {
				if (parser.getCurrentToken() == System.JSONToken.FIELD_NAME) {
					String text = parser.getText();
					if (parser.nextToken() != System.JSONToken.VALUE_NULL) {
						if (text == 'schools') {
							schools = arrayOfSchools(parser);
						} else if (text == 'total') {
							total = parser.getIntegerValue();
						} else {
							System.debug(LoggingLevel.WARN, 'Private_Z consuming unrecognized property: '+text);
							consumeObject(parser);
						}
					}
				}
			}
		}
	}
	
	public Integer status {get;set;} 
	public Data data {get;set;} 

	public FindSchoolsJson(JSONParser parser) {
		while (parser.nextToken() != System.JSONToken.END_OBJECT) {
			if (parser.getCurrentToken() == System.JSONToken.FIELD_NAME) {
				String text = parser.getText();
				if (parser.nextToken() != System.JSONToken.VALUE_NULL) {
					if (text == 'status') {
						status = parser.getIntegerValue();
					} else if (text == 'data') {
						data = new Data(parser);
					} else {
						System.debug(LoggingLevel.WARN, 'JSON2Apex consuming unrecognized property: '+text);
						consumeObject(parser);
					}
				}
			}
		}
	}
	
	public class University {
		public String city {get;set;} 
		public String lid {get;set;} 
		public String state_code {get;set;} 
		public String name {get;set;} 
		public String city_slug_id {get;set;} 
		public String slug_id {get;set;}

		public University(JSONParser parser) {
			while (parser.nextToken() != System.JSONToken.END_OBJECT) {
				if (parser.getCurrentToken() == System.JSONToken.FIELD_NAME) {
					String text = parser.getText();
					if (parser.nextToken() != System.JSONToken.VALUE_NULL) {
						if (text == 'city') {
							city = parser.getText();
						} else if (text == 'lid') {
							lid = parser.getText();
						} else if (text == 'state_code') {
							state_code = parser.getText();
						} else if (text == 'name') {
							name = parser.getText();
						} else if (text == 'city_slug_id') {
							city_slug_id = parser.getText();
						} else if (text == 'slug_id') {
							slug_id = parser.getText();
                        } else {
							System.debug(LoggingLevel.WARN, 'University consuming unrecognized property: '+text);
							consumeObject(parser);
						}
					}
				}
			}
		}
	}
	
	public class Elementary {
		public List<Schools_Z> schools {get;set;} 
		public Integer total {get;set;} 

		public Elementary(JSONParser parser) {
			while (parser.nextToken() != System.JSONToken.END_OBJECT) {
				if (parser.getCurrentToken() == System.JSONToken.FIELD_NAME) {
					String text = parser.getText();
					if (parser.nextToken() != System.JSONToken.VALUE_NULL) {
						if (text == 'schools') {
							schools = arrayOfSchools_Z(parser);
						} else if (text == 'total') {
							total = parser.getIntegerValue();
						} else {
							System.debug(LoggingLevel.WARN, 'Elementary consuming unrecognized property: '+text);
							consumeObject(parser);
						}
					}
				}
			}
		}
	}
	
	public class Data {
		public Private_Z private_Z {get;set;} // in json: private
		public List<University> university {get;set;} 
		public Elementary elementary {get;set;} 
		public Elementary middle {get;set;} 
		public Elementary high {get;set;} 

		public Data(JSONParser parser) {
			while (parser.nextToken() != System.JSONToken.END_OBJECT) {
				if (parser.getCurrentToken() == System.JSONToken.FIELD_NAME) {
					String text = parser.getText();
					if (parser.nextToken() != System.JSONToken.VALUE_NULL) {
						if (text == 'private') {
							private_Z = new Private_Z(parser);
						} else if (text == 'university') {
							university = arrayOfUniversity(parser);
						} else if (text == 'elementary') {
							elementary = new Elementary(parser);
						} else if (text == 'middle') {
							middle = new Elementary(parser);
						} else if (text == 'high') {
							high = new Elementary(parser);
						} else {
							System.debug(LoggingLevel.WARN, 'Data consuming unrecognized property: '+text);
							consumeObject(parser);
						}
					}
				}
			}
		}
	}
	
	public class Location {
		public String city_slug_id {get;set;} 
		public String city {get;set;} 
		public String state {get;set;} 

		public Location(JSONParser parser) {
			while (parser.nextToken() != System.JSONToken.END_OBJECT) {
				if (parser.getCurrentToken() == System.JSONToken.FIELD_NAME) {
					String text = parser.getText();
					if (parser.nextToken() != System.JSONToken.VALUE_NULL) {
						if (text == 'city_slug_id') {
							city_slug_id = parser.getText();
						} else if (text == 'city') {
							city = parser.getText();
						} else if (text == 'state') {
							state = parser.getText();
						} else {
							System.debug(LoggingLevel.WARN, 'Location consuming unrecognized property: '+text);
							consumeObject(parser);
						}
					}
				}
			}
		}
	}
	
	public class Schools_Z {
		public Integer rating {get;set;} 
		public String slug_id {get;set;} 
		public String id {get;set;} 
		public String name {get;set;} 
		public Location location {get;set;} 

		public Schools_Z(JSONParser parser) {
			while (parser.nextToken() != System.JSONToken.END_OBJECT) {
				if (parser.getCurrentToken() == System.JSONToken.FIELD_NAME) {
					String text = parser.getText();
					if (parser.nextToken() != System.JSONToken.VALUE_NULL) {
						if (text == 'rating') {
							rating = parser.getIntegerValue();
						} else if (text == 'slug_id') {
							slug_id = parser.getText();
						} else if (text == 'id') {
							id = parser.getText();
						} else if (text == 'name') {
							name = parser.getText();
						} else if (text == 'location') {
							location = new Location(parser);
						} else {
							System.debug(LoggingLevel.WARN, 'Schools_Z consuming unrecognized property: '+text);
							consumeObject(parser);
						}
					}
				}
			}
		}
	}
	
	
	public static FindSchoolsJson parse(String json) {
		System.JSONParser parser = System.JSON.createParser(json);
		return new FindSchoolsJson(parser);
	}
	
	public static void consumeObject(System.JSONParser parser) {
		Integer depth = 0;
		do {
			System.JSONToken curr = parser.getCurrentToken();
			if (curr == System.JSONToken.START_OBJECT || 
				curr == System.JSONToken.START_ARRAY) {
				depth++;
			} else if (curr == System.JSONToken.END_OBJECT ||
				curr == System.JSONToken.END_ARRAY) {
				depth--;
			}
		} while (depth > 0 && parser.nextToken() != null);
	}
	

    private static List<Schools_Z> arrayOfSchools_Z(System.JSONParser p) {
        List<Schools_Z> res = new List<Schools_Z>();
        if (p.getCurrentToken() == null) p.nextToken();
        while (p.nextToken() != System.JSONToken.END_ARRAY) {
            res.add(new Schools_Z(p));
        }
        return res;
    }

	public class Schools {
		public Integer rating {get;set;} 
		public String slug_id {get;set;} 
		public String id {get;set;} 
		public String name {get;set;} 
		public Location location {get;set;} 

		public Schools(JSONParser parser) {
			while (parser.nextToken() != System.JSONToken.END_OBJECT) {
				if (parser.getCurrentToken() == System.JSONToken.FIELD_NAME) {
					String text = parser.getText();
					if (parser.nextToken() != System.JSONToken.VALUE_NULL) {
						if (text == 'rating') {
							rating = parser.getIntegerValue();
						} else if (text == 'slug_id') {
							slug_id = parser.getText();
						} else if (text == 'id') {
							id = parser.getText();
						} else if (text == 'name') {
							name = parser.getText();
						} else if (text == 'location') {
							location = new Location(parser);
						} else {
							System.debug(LoggingLevel.WARN, 'Schools consuming unrecognized property: '+text);
							consumeObject(parser);
						}
					}
				}
			}
		}
	}

    private static List<Schools> arrayOfSchools(System.JSONParser p) {
        List<Schools> res = new List<Schools>();
        if (p.getCurrentToken() == null) p.nextToken();
        if (p.getCurrentToken() == System.JSONTOKEN.START_OBJECT && p.nextToken() == System.JSONToken.END_OBJECT) return res;
        while (p.nextToken() != System.JSONToken.END_ARRAY) {
            res.add(new Schools(p));
        }
        return res;
    }

    private static List<University> arrayOfUniversity(System.JSONParser p) {
        List<University> res = new List<University>();
        if (p.getCurrentToken() == null) p.nextToken();
        if (p.getCurrentToken() == System.JSONTOKEN.START_OBJECT && p.nextToken() == System.JSONToken.END_OBJECT) return res;
        while (p.nextToken() != System.JSONToken.END_ARRAY) {
            res.add(new University(p));
        }
        return res;
    }
}