import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import * as HighCharts from 'highcharts';
import HS from 'highcharts/modules/timeline';
import { DataService } from '../data/data.service';
import * as d3 from 'd3';
import { Subject } from 'rxjs';

HS(HighCharts);
@Component({
    selector: 'app-articles',
    templateUrl: './articles.component.html',
    styleUrls: ['./articles.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ArticlesComponent implements OnInit {
    options: any;
    highCharts = HighCharts;
    articles: any[];
    publishers: string[];
    selectedPublisher: string | null = 'Centrum Sentinel';
    selection;
    selectedArticle = new Subject<any>();
    originalArticles: any;
    actualSelectedArticle: any;

    constructor(private dataService: DataService) {}
    ngOnInit(): void {
        this.publishers = this.dataService.publishers;
        this.selectedArticle.subscribe((article) => {
            this.actualSelectedArticle = article;
        });
        this.initOptions();
    }

    /*                   {
        x: Date.UTC(1998, 10, 20),
        name: 'First ISS Segment Launches',
        label: 'First ISS <br/>Segment Launches',
        description:
            "The first segment of the ISS launches: a Russian proton rocket named Zarya ('sunrise').",
    }, */

    initOptions() {
        this.originalArticles = JSON.parse(
            JSON.stringify(
                this.dataService.getArticleData(this.selectedPublisher)
            )
        );

        this.actualSelectedArticle = this.originalArticles[0];
        this.articles = this.dataService
            .getArticleData(this.selectedPublisher)
            .map((el) => {
                const date = new Date(el.f_time);
                const year = date.getFullYear();
                const month = date.getMonth();
                const day = date.getDate();
                const hour = date.getHours();
                const minute = date.getMinutes();

                return {
                    x: Date.UTC(year, month, day, hour, minute),
                    label: Date.UTC(year, month, day, hour, minute),
                    name: el.title,
                    description: el.origText.substring(0, 200) + '...',
                };
            });

        this.options = {
            chart: {
                zoomType: 'x',
                type: 'timeline',
                inverted: true,
                height: '800px',
            },

            xAxis: {
                type: 'datetime',
                visible: false,
            },

            yAxis: {
                gridLineWidth: 1,
                title: null,
                labels: {
                    enabled: false,
                },
            },

            legend: {
                enabled: false,
            },

            title: {
                text: `Timeline of events as published by ${this.selectedPublisher}`,
                fontWeight: 'bolder',
            },

            tooltip: {
                style: {
                    width: 300,
                    height: 300,
                    fontSize: '10px',
                },
            },

            series: [
                {
                    dataLabels: {
                        allowOverlap: false,
                        format:
                            '<span style="color:{point.color}">● </span><span style="font-weight: bold;" > ' +
                            '{point.x:%e/%b/%Y %H:%M}</span>',
                    },
                    marker: {
                        symbol: 'circle',
                    },
                    data: this.articles,
                },
            ],
        };

        const comp = this;

        setTimeout(() => {
            this.selection = d3
                .selectAll('path.highcharts-point')
                .on('click', function (e, d) {
                    comp.selectedArticle.next(
                        comp.originalArticles[
                            Array.from(
                                d3.selectAll('path.highcharts-point')._groups[0]
                            ).indexOf(this)
                        ]
                    );
                });
        }, 500);
    }
}
