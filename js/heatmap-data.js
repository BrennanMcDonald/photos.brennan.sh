(() => {
  // ns-params:@params
  var data = {"2021-09-24": 3, "2021-10-10": 5, "2021-10-13": 2, "2021-10-15": 8, "2021-10-16": 2, "2021-10-20": 2, "2021-10-22": 1, "2021-10-31": 1, "2021-11-26": 1};

  // <stdin>
  if (data) {
    const calData = Object.keys(data).map((date) => ({
      date,
      total: data[date],
      details: [],
      summary: []
    }));
    const div_id = "calendar";
    const label = "Photos";
    const color = "#cd2327";
    const overview = "global";
    const handler = function(val) {
      console.log(val);
      window.location = "/about";
    };
    calendarHeatmap.init(calData, div_id, color, overview, handler, label);
  }
})();
