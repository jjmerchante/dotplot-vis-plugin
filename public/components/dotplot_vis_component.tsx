/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * Bitergia requires contributions made to this file be 
 * licensed under the Apache-2.0 license or a compatible
 * open source license.
 *
 * Any modifications Copyright Bitergia.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import React from 'react';
import Plot from 'react-plotly.js';
import randomColor from 'randomcolor';

export const DotplotVisComponent = ({ visData }) => {
  const defaultDotSize = 10;
  const dicColor = {};
  const isSecondFieldEnabled = visData.aggs?.bySchemaName('field')[1]?.enabled;
  const isDotSizeEnabled = visData.aggs?.bySchemaName('dotsize')[0]?.enabled;
  const id_firstfield = '0';
  let id_secondfield;
  let id_x = '1';
  let id_y = '2';
  let id_size = '3';

  if (isSecondFieldEnabled) {
    if (isDotSizeEnabled) {
      id_secondfield = '4'
      id_x = '5'
      id_y = '6'
      id_size = '7'
    } else {
      id_secondfield = '3'
      id_x = '4'
      id_y = '5'
    }
  }

  const getAxisTitle = (axis: String) => {
    if (!visData.aggs.bySchemaName(axis)) {
      return "";
    }
    const axisData = visData.aggs.bySchemaName(axis)[0];
    if (axisData.params.customLabel) {
      return axisData.params.customLabel;
    } else {
      const name = axisData.type.name == "count" ? "" : axisData.params.field.displayName;
      const title = `${axisData.type.title} ${name}`;
      return title;
    }
  }

  const metricsAgg_xAxis_title = getAxisTitle('x-axis');
  const metricsAgg_yAxis_title = getAxisTitle('y-axis');


  if (isDotSizeEnabled) {
    var firstBuketSized = visData.tables[0].rows.map((b) => { return b[id_size] });
    var max = Math.max(...firstBuketSized);
    var min = Math.min(...firstBuketSized);
    var chartMin = 10;
    var chartMax = 100;
    var step = max - min;
    var chartDiff = chartMax - chartMin;
  }

  const dataParsed = visData.tables[0].rows.map((bucket) => {
    const data = {
      mode: 'markers',
      name: bucket[id_firstfield].value,
      x: [bucket[id_x].value],
      y: [bucket[id_y]?.value],
      text: bucket[id_firstfield].value,
      marker: {
        sizemode: 'diameter',
        size: defaultDotSize,
      }
    };

    if (isDotSizeEnabled) {
      const size = ((bucket[id_size].value - min) / step) * chartDiff + chartMin;
      Object.assign(data, { marker: { size: size } });
    }

    if (isSecondFieldEnabled) {
      const color = dicColor[bucket[id_firstfield].value] || randomColor();
      dicColor[bucket[id_firstfield].value] = color;
      Object.assign(data, {
        name: bucket[id_secondfield].value,
        text: bucket[id_secondfield].value,
        marker: { color: color, ...data.marker }
      });
    }

    return data;
  });

  return (
    <Plot
      data={dataParsed}
      layout={{
        xaxis: { title: metricsAgg_xAxis_title },
        yaxis: { title: metricsAgg_yAxis_title },
        margin: { t: 20 },
        hovermode: 'closest',
        showlegend: false,
      }}
      config={{ responsive: true }}
      className="dotplot"
    />
  )
}
