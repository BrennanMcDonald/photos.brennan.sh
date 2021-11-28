(() => {
  // ns-params:@params
  var data = {};

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
