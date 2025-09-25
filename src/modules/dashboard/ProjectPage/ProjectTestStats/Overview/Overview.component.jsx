import { useUiStore } from '@/stores';
import { Box, Typography } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
import style from './Overview.module.scss';

const Overview = ({ stats }) => {
  const { theme } = useUiStore();

  const pieData = [
    {
      id: 1,
      value: stats.passed,
      label: 'Passed',
      color: theme.palette.charts.success
    },
    {
      id: 2,
      value: stats.failed,
      label: 'Failed',
      color: theme.palette.charts.error
    },
    {
      id: 3,
      value: stats.incomplete,
      label: 'Inconclusive',
      color: theme.palette.charts.warning
    },
    {
      id: 4,
      value: stats.manual,
      label: 'Not run',
      color: theme.palette.charts.info
    }
  ];

  let manual = stats.manual;
  let automated = stats.automated;

  if (manual > automated) {
    manual -= automated;
  } else {
    automated -= manual;
  }

  return (
    <>
      <Box className={style.section}>
        <Typography>By Status</Typography>
        <PieChart
          series={[
            {
              data: pieData.filter(d => d.value > 0),
              highlightScope: { fade: 'series', highlight: 'item' },
              innerRadius: 35
            }
          ]}
          slotProps={{
            tooltip: {
              className: style.tooltip,
              placement: 'top-start'
            }
          }}
          width={120}
          height={120}
          margin={0}
          className={style.pieChart}
        />
      </Box>
      <Box className={style.section}>
        <Typography>By Type</Typography>
        <LineChart
          disableAxisListener
          disableLineItemHighlight
          height={40}
          margin={0}
          dataset={[
            { x: 0, manual: 0, automated: 0 },
            { x: 0.1, manual, automated },
            { x: 0.9, manual, automated },
            { x: 1, manual: 0, automated: 0 }
          ]}
          xAxis={[
            {
              id: 'x',
              dataKey: 'x',
              min: 0,
              max: 1,
              hideTooltip: true,
              position: 'none',
              domainLimit: 'strict'
            }
          ]}
          yAxis={[
            {
              position: 'none',
              domainLimit: 'strict'
            }
          ]}
          series={[
            {
              id: 'manual',
              dataKey: 'manual',
              label: 'Manual',
              stack: 'total',
              area: true,
              showMark: false,
              disableHighlight: true,
              color: theme.palette.charts.warning,
              stackOrder: 'ascending',
              valueFormatter: () => stats.manual?.toLocaleString(),
              curve: 'monotoneX',
              labelMarkType: 'circle'
            },
            {
              id: 'automated',
              dataKey: 'automated',
              label: 'Automated',
              stack: 'total',
              area: true,
              showMark: false,
              disableHighlight: true,
              color: theme.palette.charts.success,
              stackOrder: 'ascending',
              valueFormatter: () => stats.automated?.toLocaleString(),
              curve: 'monotoneX',
              labelMarkType: 'circle'
            }
          ]}
          skipAnimation
          slotProps={{
            legend: {
              direction: 'vertical'
            },
            tooltip: {
              className: style.tooltip,
              placement: 'top-start'
            }
          }}
          axisHighlight={{
            x: 'band',
            y: 'none'
          }}
        />
      </Box>
    </>
  );
};
export default Overview;
