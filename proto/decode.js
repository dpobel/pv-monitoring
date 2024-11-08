import protobuf from "protobufjs";
import fs from "fs";
import jsonDescriptor from "./solar.json" with { type: "json" };

// {
// id: 'station_day',
// key: 'LineChart',
// title: '电站发电详数据(日-精确到分钟)',
// url: '/pvm-data/api/0/station/data/count_power_by_day'
// },
// {
// id: 'station_energy_day',
// key: 'LineChart',
// title: '电站电量详数据(日-精确到分钟)',
// url: '/pvm-data/api/0/station/data/count_eq_by_day'
// },
// {
// id: 'station_week',
// key: 'LineChartArray',
// title: '电站发电详数据(周-精确到天/分钟)',
// url: '/pvm-data/api/0/station/data/count_power_by_week'
// },
// {
// id: 'station_month',
// key: 'LineChart',
// title: '电站发电详数据(月-精确到天)',
// url: '/pvm-data/api/0/station/data/count_eq_by_day_of_month'
// },
// {
// id: 'station_year',
// key: 'LineChart',
// title: '电站发电详数据(年-精确到月)',
// url: '/pvm-data/api/0/station/data/count_eq_by_month_of_year'
// },
// {
// id: 'station_all',
// key: 'LineChart',
// title: '电站发电详数据(所有-精确到年)',
// url: '/pvm-data/api/0/station/data/count_eq_by_total_of_year'
// },
// {
// id: 'station_billing',
// key: 'LineChart',
// title: '电站计费周期(自定义时间段-精确到天)',
// url: '/pvm-data/api/0/station/data/count_eq_by_day_of_month'
// },
// {
// id: 'station_comparative_year',
// key: 'LineChart',
// title: '统计所有年每月的指标数据(历史数据对比)',
// url: '/pvm-data/api/0/station/data/count_quota_by_month_of_year'
// },
// {
// id: 'station_comparative_all',
// key: 'LineChart',
// title: '统计所有年的指标数据(历史数据对比)',
// url: '/pvm-data/api/0/station/data/count_quota_by_total_of_year'
// },
// {
// id: 'station_day_full_year',
// key: 'LineChart',
// title: '电站发电详数据（一年内每天电量）',
// url: '/pvm-data/api/0/station/data/count_eq_by_day_of_year'
// },
// {
// id: 'micro_day',
// key: 'LineChart',
// title: '微逆发电详情(日-精确到分钟)',
// url: '/pvm-data/api/0/micro/data/count_by_day'
// },
// {
// id: 'micro_week',
// key: 'LineChartArray',
// title: '微逆发电详情(周-精确到天/分钟)',
// url: '/pvm-data/api/0/micro/data/count_by_week'
// },
// {
// id: 'inverter_day',
// key: 'LineChart',
// title: '储能逆变器统计指标数据(日-精确到分钟)',
// url: '/pvm-data/api/0/indicators/data/count_indicators_data'
// },
// {
// id: 'module_day',
// key: 'LineChart',
// title: '组件发电详情(日-精确到分钟)',
// url: '/pvm-data/api/0/module/data/count_by_day'
// },
// {
// id: 'module_week',
// key: 'LineChartArray',
// title: '组件发电详情(周-精确到天/分钟)',
// url: '/pvm-data/api/0/module/data/count_by_week'
// },
// {
// id: 'layout_station_day',
// key: 'PlayPowerChart',
// title: '组件布局(电站-每天功率曲线，回放使用)',
// url: '/pvm-data/api/0/station/data/count_playback_power_by_day'
// },
// {
// id: 'layout_station_week',
// key: 'PlayPowerChartArray',
// title: '组件布局(电站-最近7天的功率曲线，回放使用)',
// url: '/pvm-data/api/0/station/data/count_playback_power_by_week'
// },
// {
// id: 'layout_module_day',
// key: 'PlayModuleData',
// title: '组件布局(单个组件-按时间的功率，每天)',
// url: '/pvm-data/api/0/module/data/down_module_day_data'
// },
// {
// id: 'layout_module_eq',
// key: 'PlayModuleData',
// title: '组件布局(单个组件-按时间的发电量，包括日、月、年、总)',
// url: '/pvm-data/api/0/module/data/count_eq_by_station'
// },
// {
// id: 'home_station_eq',
// key: 'LineChart',
// title: '管理员首页（统计电站月、年、总电量）',
// url: '/pvm-data/api/0/statistics/count_station_eq'
// },
// {
// id: 'home_station_eq_and_capacitor',
// key: 'LineChart',
// title: '管理员首页（统计电站月、年、总装机容量）',
// url: '/pvm-data/api/0/statistics/count_station_eq_and_capacitor'
// },
// {
// id: 'count_dtu_conn',
// key: 'LineChart',
// title: '统计DTU连接数',
// url: '/ops/pub/0/monitor/count_dtu_conn'
// },
// {
// id: 'count_mq_delay',
// key: 'LineChart',
// title: '统计前置机MQ延迟',
// url: '/ops/pub/0/monitor/count_mq_delay'
// },
// {
// id: 'count_agent_monitor',
// key: 'LineChart',
// title: '统计Agent Monitor',
// url: '/ops/pub/0/monitor/count_agent_metrics'
// }

const root = new protobuf.Root();
root.addJSON(jsonDescriptor);
fs.readFile("output.bin", (err, buffer) => {
  if (err) {
    throw err;
  }
  const result = root.lookup("LineChart").decode(buffer);
  console.log(
    result.series.map((serie) => {
      return serie.data.reverse();
    }),
  );
});
