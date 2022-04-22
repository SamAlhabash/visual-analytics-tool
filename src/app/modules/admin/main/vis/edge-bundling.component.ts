import {
    AfterViewInit,
    Component,
    OnInit,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { DataService } from '../data/data.service';
import * as d3 from 'd3';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
@Component({
    selector: 'app-edge-bundling',
    templateUrl: './edge-bundling.component.html',
    styleUrls: ['./edge-bundling.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class EdgeBundlingComponent implements OnInit {
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    emailData: any;
    dateRange = new FormGroup({
        start: new FormControl(new Date(2014, 0, 6)),
        end: new FormControl(new Date(2014, 0, 7)),
    });
    minDate = new Date(2014, 0, 6);
    maxDate = new Date(2014, 0, 17);
    data: any;
    link: any;
    root: any;
    depts: any;
    d3 = d3;
    panelOpenState = false;
    tension = 0.5;
    line: any;
    fontSize = 10;
    width = 800;
    selectedEmployee = null;

    selectionChanged = new Subject<any>();

    displayedColumns: string[] = ['From', 'To', 'Date', 'Status', 'Subject'];
    dataSource: MatTableDataSource<any>;
    colorScheme = {
        domain: d3.schemePaired,
    };

    countObj = [];
    selectedEmail = null;
    constructor(private dataService: DataService) {}

    ngOnInit(): void {
        this.depts = this.dataService.getUniqueDepts();

        this.selectionChanged.subscribe((email) => {
            const endDate = this.dateRange.get('end').value;
            endDate.setHours(23, 59, 59, 999);
            this.selectedEmail = email;
            this.selectedEmployee = this.dataService.getEmployee(email);
            this.emailData = this.dataService.getEmailData(
                this.dateRange.get('start').value,
                endDate,
                email,
                true
            );
            this.dataSource = new MatTableDataSource(this.emailData);
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            this.countObj = this.dataService.getBarChartData(
                this.dateRange.get('start').value,
                endDate,
                email
            );
        });
        this.dataSource = new MatTableDataSource(this.emailData);
        this.edgeBundlingInit();
    }
    edgeBundlingInit(): void {
        // check if svg exists, delete it if it does
        d3.select('#SVG').remove();
        const colorin = '#00f';
        const colorout = '#f00';
        const colornone = '#ccc';
        const comp = this;
        const width = this.width;
        const radius = width / 2;
        this.line = d3
            .lineRadial()
            .curve(d3.curveBundle.beta(comp.tension))
            .radius((d) => d.y)
            .angle((d) => d.x);
        const tree = d3.cluster().size([2 * Math.PI, radius - 100]);
        const endDate = this.dateRange.get('end').value;
        endDate.setHours(23, 59, 59, 999);
        this.root = tree(
            comp.bilink(
                d3.hierarchy(
                    comp.dataService.getEdgeBundlingData(
                        comp.dateRange.get('start').value,
                        endDate
                    )
                )
            )
        );
        const svg = d3
            .select('#svg')
            .append('svg')
            .attr('viewBox', [-width / 2, -width / 2, width, width])
            .attr('id', 'SVG');
        const link = svg
            .append('g')
            .attr('stroke', colornone)
            .attr('fill', 'none')
            .selectAll('path')
            .data(this.root.leaves().flatMap((leaf) => leaf.outgoing))
            .join('path')
            .style('mix-blend-mode', 'multiply')
            .attr('d', ([i, o]) => comp.line(i.path(o)))
            //eslint-disable-next-line
            .each(function (d) {
                d.path = this;
            });
        //eslint-disable-next-line
        function overed(event, d) {
            link.style('mix-blend-mode', null);
            d3.select(this).attr('font-weight', 'bold');
            //eslint-disable-next-line
            d3.selectAll(d.incoming.map((d) => d.path))
                .attr('stroke', colorin)
                .raise();
            //eslint-disable-next-line
            d3.selectAll(d.incoming.map(([d]) => d.text))
                .attr('fill', colorin)
                .attr('font-weight', 'bold');
            //eslint-disable-next-line
            d3.selectAll(d.outgoing.map((d) => d.path))
                .attr('stroke', colorout)
                .raise();
            //eslint-disable-next-line
            d3.selectAll(d.outgoing.map(([, d]) => d.text))
                .attr('fill', colorout)
                .attr('font-weight', 'bold');
        }
        //eslint-disable-next-line
        function outed(event, d) {
            link.style('mix-blend-mode', 'multiply');
            d3.select(this).attr('font-weight', null);
            //eslint-disable-next-line
            d3.selectAll(d.incoming.map((d) => d.path)).attr('stroke', null);
            //eslint-disable-next-line
            d3.selectAll(d.incoming.map(([d]) => d.text))
                .attr('fill', null)
                .attr('font-weight', null);
            //eslint-disable-next-line
            d3.selectAll(d.outgoing.map((d) => d.path)).attr('stroke', null);
            //eslint-disable-next-line
            d3.selectAll(d.outgoing.map(([, d]) => d.text))
                .attr('fill', null)
                .attr('font-weight', null);
        }
        //eslint-disable-next-line
        const node = svg
            .append('g')
            .attr('font-family', 'sans-serif')
            .attr('font-size', 5)
            .selectAll('g')
            .data(this.root.leaves())
            .join('g')
            .attr(
                'transform',
                (d) =>
                    `rotate(${(d.x * 180) / Math.PI - 90}) translate(${d.y},0)`
            )
            .append('text')
            .attr('dy', '0.31em')
            .attr('x', (d) => (d.x < Math.PI ? 6 : -6))
            .attr('text-anchor', (d) => (d.x < Math.PI ? 'start' : 'end'))
            .attr('transform', (d) => (d.x >= Math.PI ? 'rotate(180)' : null))
            .attr(
                'style',
                (d) =>
                    `fill: ${
                        d3.schemeCategory10[
                            comp.depts.indexOf(d.parent.data.name)
                        ]
                    }`
            )
            .attr('text-decoration', (d) => {
                if (d.data.name === comp.selectedEmail) {
                    return 'underline';
                }

                return null;
            })
            .text((d) => d.data.name.split('@')[0].split('.').join(' '))
            .style('cursor', 'pointer')
            .style('font-size', `${comp.fontSize}px`)
            //eslint-disable-next-line
            .each(function (d) {
                d.text = this;
            })
            .on('mouseover', overed)
            .on('mouseout', outed)
            .on('click', function (d) {
                d3.select('#SVG')
                    .selectAll('text')
                    .attr('text-decoration', null);
                d3.select(this).attr('text-decoration', 'underline');
                comp.selectionChanged.next(
                    d3.select(this).select('title').text().split('\n')[0]
                );
            })
            .call((text) =>
                text.append('title').text((d) => {
                    let name = comp.id(d).split('.');
                    name.splice(0, 2);
                    name = name.join('.');
                    return `${name}
${d.outgoing.length} Recieved
${d.incoming.length} Sent`;
                })
            );
    }

    handleDateChange(): void {
        if (
            this.dateRange.get('start').value &&
            this.dateRange.get('end').value
        ) {
            this.edgeBundlingInit();
            if (this.selectedEmail) {
                this.selectionChanged.next(this.selectedEmail);
            }
        }
    }

    getToRow(emails): string {
        // returns the first 3 elements of emails
        const emailss = emails.split(', ');
        let toRow = '';
        for (let i = 0; i < 3; i++) {
            if (emailss[i]) {
                toRow += emailss[i] + ', ';
            }
        }
        return toRow;
    }

    handleTensionChange(): void {
        this.edgeBundlingInit();
    }

    bilink(root): any {
        const comp = this;
        const map = new Map(root.leaves().map((d) => [comp.id(d), d]));
        for (const d of root.leaves()) {
            // eslint-disable-next-line
            (d.incoming = []),
                (d.outgoing = d.data.imports.map((i) => [d, map.get(i)]));
        }
        for (const d of root.leaves()) {
            for (const o of d.outgoing) {
                try {
                    o[1].incoming.push(o);
                } catch (error) {
                    continue;
                }
            }
        }
        return root;
    }

    //eslint-disable-next-line
    id(node) {
        return `${node.parent ? this.id(node.parent) + '.' : ''}${
            node.data.name
        }`;
    }
}
