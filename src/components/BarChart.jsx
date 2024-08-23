import React, { useRef, useEffect } from 'react';
import { Chart, registerables } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '@mui/material';

Chart.register(...registerables);

const BarChart = ({ data = { event: [], staffs: [], participants: [] }, categories = [] }) => {
  const theme = useTheme();
  const colors = theme.palette.mode === 'dark' ? ['#2196f3', '#f44336', '#ffeb3b'] : ['#0d47a1', '#b71c1c', '#fbc02d'];
  
  const chartRef = useRef(null);

  useEffect(() => {
    const chart = chartRef.current;

    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  }, []);

  const chartData = {
    labels: categories,
    datasets: [
      {
        label: 'Event',
        backgroundColor: colors[0],
        data: data.event || []
      },
      {
        label: 'Staffs',
        backgroundColor: colors[1],
        data: data.staffs || []
      },
      {
        label: 'Participants',
        backgroundColor: colors[2],
        data: data.participants || []
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: 'Expenses Breakdown'
      }
    }
  };

  return <Bar ref={chartRef} data={chartData} options={options} />;
};

export default BarChart;
