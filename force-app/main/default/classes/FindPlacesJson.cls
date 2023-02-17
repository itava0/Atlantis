public class FindPlacesJson {

	public class Geometry {
		public Location location;
		public Viewport viewport;
	}

	public class Photos {
		public Integer height;
		public List<String> html_attributions;
		public String photo_reference;
		public Integer width;
	}

	public List<Html_attributions> html_attributions;
	public List<Results> results;
	public String status;

	public class Plus_code {
		public String compound_code;
		public String global_code;
	}

	public class Results {
		public String business_status;
		public Geometry geometry;
		public String icon;
		public String icon_background_color;
		public String icon_mask_base_uri;
		public String name;
		public List<Photos> photos;
		public String place_id;
		public Plus_code plus_code;
		public Double rating;
		public String reference;
		public String scope;
		public List<String> types;
		public Integer user_ratings_total;
		public String vicinity;
		public Boolean permanently_closed;
	}

	public class Viewport {
		public Location northeast;
		public Location southwest;
	}

	public class Html_attributions {
	}

	public class Location {
		public Double lat;
		public Double lng;
	}

	
	public static FindPlacesJson parse(String json) {
		return (FindPlacesJson) System.JSON.deserialize(json, FindPlacesJson.class);
	}
}