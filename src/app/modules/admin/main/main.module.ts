import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Route, RouterModule } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { EdgeBundlingComponent } from './vis/edge-bundling.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatSortModule } from '@angular/material/sort';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ArticlesComponent } from './articles/articles.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { MatSelectModule } from '@angular/material/select';

const routes: Route[] = [
    {
        path: 'about',
        component: AboutComponent,
    },
    {
        path: 'edge-bundling',
        component: EdgeBundlingComponent,
    },
    {
        path: 'articles',
        component: ArticlesComponent,
    },
];

@NgModule({
    declarations: [AboutComponent, EdgeBundlingComponent, ArticlesComponent],
    imports: [
        RouterModule.forChild(routes),
        MatFormFieldModule,
        MatInputModule,
        FormsModule,
        ReactiveFormsModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatDividerModule,
        CommonModule,
        MatExpansionModule,
        MatIconModule,
        MatSliderModule,
        MatDividerModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        NgxChartsModule,
        HighchartsChartModule,
        MatSelectModule,
    ],
})
export class MainModule {}
