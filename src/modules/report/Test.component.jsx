import { TEST_PDF_MAX_PAGES_IN_DETAILS } from '@/constants/report';
import { chunkArray } from '@/electron/lib/utils';
import { useUiStore } from '@/stores';
import { Box, LinearProgress, Typography } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { PieChart } from '@mui/x-charts/PieChart';
import classNames from 'classnames';
import { useRouter } from 'next/router';
import { Fragment, useEffect, useState } from 'react';
import layoutStyle from './Layout.module.scss';
import testStyle from './Test.module.scss';

const style = {
  ...layoutStyle,
  ...testStyle
};

const Test = () => {
  const router = useRouter();
  const { id } = router.query;

  const [stats, setStats] = useState({});

  useEffect(() => {
    if (!id) return;
    const getStats = async () => {
      const newTestStats = await window.api.environmentTest.getStats({ id });
      setStats(newTestStats);
    };
    getStats();
  }, [id]);

  const { theme } = useUiStore();

  const total = stats.total;
  const auditor = stats.auditor;
  const auditorOrg = auditor?.organization;

  const pieData = [
    {
      id: 1,
      value: stats.manual,
      label: () => (
        <Typography className={style.legendLabel}>
          Manual{' '}
          <strong>
            {stats.manual?.toLocaleString()} ({((stats.manual / total) * 100).toFixed(1)}%)
          </strong>
        </Typography>
      ),
      color: theme.palette.charts.success
    },
    {
      id: 2,
      value: stats.automated,
      label: () => (
        <Typography className={style.legendLabel}>
          Automated{' '}
          <strong>
            {stats.automated?.toLocaleString()} ({((stats.automated / total) * 100).toFixed(1)}%)
          </strong>
        </Typography>
      ),
      color: theme.palette.charts.info
    }
  ];

  let statusData = [
    {
      key: 'passed',
      label: 'Passed',
      count: stats.passed,
      areaCount: 0,
      color: theme.palette.charts.error,
      percentage: ((stats.passed / total) * 100).toFixed(1)
    },
    {
      key: 'failed',
      label: 'Failed',
      count: stats.failed,
      areaCount: 0,
      color: theme.palette.charts.warning,
      percentage: ((stats.failed / total) * 100).toFixed(1)
    },
    {
      key: 'notRun',
      label: 'Not run',
      count: stats.manual,
      areaCount: 0,
      color: theme.palette.charts.success,
      percentage: ((stats.manual / total) * 100).toFixed(1)
    },
    {
      key: 'inconclusive',
      label: 'Inconclusive',
      count: stats.incomplete,
      areaCount: 0,
      color: theme.palette.charts.info,
      percentage: ((stats.incomplete / total) * 100).toFixed(1)
    }
  ];
  const areaData = [...statusData].sort((a, b) => b.count - a.count);

  for (let i = 0; i < areaData.length; i++) {
    let j = i + 1;
    let curr = areaData[i];
    let next = areaData[j];
    curr.areaCount = curr.count - next?.count || 0;
  }

  const initialAreaData = Object.fromEntries(areaData.map(item => [item.key, 0]));
  const finalAreaData = Object.fromEntries(areaData.map(item => [item.key, item.areaCount]));
  let areaDataset = [
    { x: 0, ...initialAreaData },
    { x: 0, ...finalAreaData },
    { x: 1, ...finalAreaData },
    { x: 1, ...initialAreaData }
  ];

  let areaSeries = areaData.map((item, i) => ({
    id: item.key,
    dataKey: item.key,
    label: () => (
      <Typography className={style.legendLabel}>
        {item.label}
        <strong>
          &nbsp;{item.count?.toLocaleString()} ({item.percentage}%)
        </strong>
      </Typography>
    ),
    stack: 'total',
    area: true,
    showMark: false,
    disableHighlight: true,
    color: item.color,
    valueFormatter: () => item.count?.toLocaleString(),
    curve: 'monotoneX',
    labelMarkType: 'circle'
  }));

  if (!id || !stats) return null;

  const pageStatsChunked = chunkArray(stats?.pageStats, TEST_PDF_MAX_PAGES_IN_DETAILS);

  return (
    <main className={style.root}>
      <Box className={classNames(style.page, style.overviewPage)}>
        <header className={style.header}>
          <Typography className={style.title} variant='h1'>
            {stats.test?.name} summary report
          </Typography>
          <Typography className={style.title}>{total?.toLocaleString()} test cases</Typography>
        </header>
        {auditor && (
          <section className={classNames(style.section, style.auditor)}>
            <Typography variant='h2' className={style.title}>
              Test auditor details
            </Typography>
            <Box className={style.details}>
              <Box>
                <Typography className={style.item}>
                  <strong>First name:</strong>&nbsp;{auditor.first_name}
                </Typography>
                <Typography className={style.item}>
                  <strong>Last name:</strong>&nbsp;{auditor.last_name}
                </Typography>
                <Typography className={style.item}>
                  <strong>Title:</strong>&nbsp;{auditor.title}
                </Typography>
              </Box>
              <Box>
                {auditorOrg.name && (
                  <Typography className={style.item}>
                    <strong>Organisation name:</strong>&nbsp;{auditorOrg.name}
                  </Typography>
                )}
                {auditorOrg.email && (
                  <Typography className={style.item}>
                    <strong>Email:</strong>&nbsp;{auditorOrg.email}
                  </Typography>
                )}
                {auditorOrg.phone && (
                  <Typography className={style.item}>
                    <strong>Phone number:</strong>&nbsp;{auditorOrg.phone}
                  </Typography>
                )}
                {auditorOrg.address && (
                  <Typography className={classNames(style.item, style.ellipse)}>
                    <strong>Address:</strong>&nbsp;{auditorOrg.address}
                  </Typography>
                )}
                {auditorOrg.country && (
                  <Typography className={style.item}>
                    <strong>Country:</strong>&nbsp;{auditorOrg.country.name}
                  </Typography>
                )}
                {auditorOrg.url && (
                  <Typography className={style.item}>
                    <strong>Website:</strong>&nbsp;{auditorOrg.url}
                  </Typography>
                )}
              </Box>
            </Box>
          </section>
        )}
        <section className={classNames(style.section, style.overview)}>
          <Typography variant='h2' className={style.title}>
            Overview
          </Typography>
          <Box className={style.details}>
            <Box className={style.item}>
              <Typography variant='h3'>By type</Typography>
              <LineChart
                disableAxisListener
                disableLineItemHighlight
                height={140}
                width={140}
                margin={0}
                dataset={areaDataset}
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
                    domainLimit: 'strict',
                    hideTooltip: true,
                    position: 'none'
                  }
                ]}
                series={areaSeries}
                skipAnimation
                slotProps={{
                  legend: {
                    direction: 'vertical'
                  }
                }}
                axisHighlight={{
                  x: 'none',
                  y: 'none'
                }}
                sx={{
                  '& .MuiChartsLabelMark-root': {
                    width: '8px !important',
                    height: '8px !important'
                  }
                }}
                className={style.chart}
              />
            </Box>
            <Box className={style.item}>
              <Typography variant='h3'>By status</Typography>
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
                    placement: 'top-start'
                  }
                }}
                sx={{
                  '& .MuiChartsLabelMark-root': {
                    width: '8px !important',
                    height: '8px !important'
                  }
                }}
                width={140}
                height={140}
                margin={0}
                className={classNames(style.pieChart, style.chart)}
                skipAnimation
              />
            </Box>
          </Box>
        </section>
        <section className={classNames(style.section, style.principles)}>
          <Typography variant='h2' className={style.title}>
            Principles
          </Typography>
          <Box className={style.details}>
            {stats?.principleStats
            && Object.entries(stats.principleStats).map(([name, { count, total }]) => (
              <Box key={name} className={style.stat}>
                <Box className={style.summary}>
                  <Typography className={style.name}>{name}</Typography>
                  <Typography className={style.caption}>{`${count?.toLocaleString()} / ${total?.toLocaleString()}`}</Typography>
                </Box>
                <LinearProgress className={style.progressBar} variant='determinate' value={(count / total) * 100} />
              </Box>
            ))}
          </Box>
        </section>
      </Box>
      {pageStatsChunked.map((testStats, i) => (
        <Box className={classNames(style.page, style.detailsPage)} key={i}>
          <header className={style.header}>
            <Typography className={style.title} variant='h1'>
              Details per page
            </Typography>
            <Box className={style.legend}>
              {statusData.map(item => (
                <Box className={style.item} key={item.key}>
                  <Box className={style.mark} sx={{ backgroundColor: item.color }}></Box>
                  <Typography>{item.label}</Typography>
                </Box>
              ))}
            </Box>
          </header>
          <section className={classNames(style.section, style.pageDetails)}>
            <Typography variant='h2' className={style.title}>
              For the [{stats.totalPages}] selected pages in {stats.test?.name}
            </Typography>
            <Box className={style.details}>
              {testStats?.map((stat) => {
                const envPage = stat.test.environment_page;
                const url = `${envPage.environment.url}/${envPage.path}`;
                if (!envPage) return;
                return (
                  <Box key={envPage.id} className={style.stat}>
                    <Box className={style.summary}>
                      <Typography className={style.name}>{envPage.name}</Typography>
                      <Typography className={style.caption}>{url}</Typography>
                    </Box>
                    <Box className={style.progressBar}>
                      {statusData.map(status => (
                        <Fragment key={status.key}>
                          <Box className={style[status.key]} sx={{ backgroundColor: status.color, width: `${status.percentage}%` }}></Box>
                        </Fragment>
                      ))}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </section>
        </Box>
      ))}
    </main>
  );
};

export default Test;
