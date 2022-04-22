import { Injectable } from '@angular/core';
import * as EmailData from './json/email_headers_filtered.json';
import * as EmployeeData from './json/EmployeeRecords.json';
import * as ArticleData from './json/articles.json';
import * as d3 from 'd3';

@Injectable({
    providedIn: 'root',
})
export class DataService {
    emailData: any[];
    employeeData: any[];
    emailDataFormatted: any[];
    uniqueEmails = [];
    depts = [];
    publishers = [
        'Centrum Sentinel',
        'Homeland Illumination',
        'The Abila Post',
        'Kronos Star',
        'Modern Rubicon',
        'Tethys News',
    ];
    articleData: any[];

    constructor() {
        this.emailData = this._formatEmailData();
        this.employeeData = this._formatEmployeeData();
        this.uniqueEmails = this._formatEmailDataFormatted();
        this.articleData = this._formatArticleData();
        this.depts = this._getUniqueDepts();
    }

    getArticleData(publisher: string): any[] {
        return this.articleData
            .filter((el) => el.publisher === publisher)
            .sort((el) => el.date);
    }

    getBarChartData(startDate, endDate, email): any {
        const filretedEmails = this.getEmailData(startDate, endDate, email);
        const countObj = {};
        for (const filteredEmail of filretedEmails) {
            for (const word of filteredEmail.filtered) {
                if (countObj[word] === undefined) {
                    countObj[word] = 1;
                } else {
                    countObj[word] += 1;
                }
            }
        }
        let returnObj = [];
        for (const key in countObj) {
            returnObj.push({
                name: key,
                value: countObj[key],
            });
        }

        returnObj = returnObj.sort((a, b) => b.value - a.value);
        return returnObj;
    }

    getUniqueDepts(): any {
        return this.depts;
    }

    getUniquePublishers(): any[] {
        return this.publishers;
    }

    getEdgeBundlingData(startDate, endDate): any {
        const dict = { name: 'Vis', children: [] };
        const children = dict.children;
        const filteredEmails = this.emailData.filter((el) => {
            const bool = el.Date > startDate && el.Date < endDate;
            return bool;
        });
        for (const dept of this.depts) {
            const deptEmails = this.employeeData
                .filter((el) => el.CurrentEmploymentType === dept)
                .map((el) => el.EmailAddress);
            const childArrayComplete = [];
            for (const deptEmail of deptEmails) {
                const imports = [];
                for (const email of filteredEmails) {
                    const to = email.To;
                    const modEmail = this.employeeData.find(
                        (x) => x.EmailAddress === email.From
                    ).EmailAddressMod;
                    if (to.indexOf(deptEmail) !== -1) {
                        imports.push(`Vis.${modEmail}`);
                    }
                }
                childArrayComplete.push({ name: deptEmail, imports: imports });
            }
            children.push({ name: dept, children: childArrayComplete });
        }
        return dict;
    }

    getEmailData(
        startDate: Date,
        endDate: Date,
        email: string,
        table = false
    ): any {
        let filteredEmails = JSON.parse(JSON.stringify(this.emailData));
        filteredEmails.forEach((el) => {
            el.Date = new Date(el.Date);
        });
        filteredEmails = filteredEmails.filter((el) => {
            const bool = el.Date > startDate && el.Date < endDate;
            return bool;
        });
        let fromEmails = filteredEmails.filter((el) => {
            const bool = el.From === email || el.To.indexOf(email) !== -1;
            return bool;
        });

        const extraArr = [];
        fromEmails = fromEmails.map((el) => {
            if (el.From === email) {
                el.Status = 'Sent';
            }

            if (el.To.indexOf(email) !== -1) {
                if (el.Status && el.Status == 'Sent') {
                    const newEl = JSON.parse(JSON.stringify(el));
                    newEl.Status = 'Received';
                    newEl.Date = new Date(newEl.Date);
                    extraArr.push(newEl);
                } else {
                    el.Status = 'Received';
                }
            }

            return el;
        });

        const returnValue = fromEmails.concat(extraArr);
        returnValue.forEach((el) => {
            try {
                el.To = el.To.join(', ');
            } catch (e) {}
        });

        if (!table) {
            return returnValue;
        } else {
            for (const el of returnValue) {
                const temp = el.To.split(', ');
                if (temp.length <= 3) {
                    el.ToLong = '';
                } else {
                    el.ToLong = temp.join(', ');
                    el.To = temp.slice(0, 3).join(', ');
                    el.Selected = false;
                }
            }

            return returnValue;
        }
    }

    getEmployeeData(): any {
        return this.employeeData;
    }

    getUniqueEmails(): any {
        return this.uniqueEmails;
    }

    getEmployee(email): any {
        const returnValue = this.employeeData.find(
            (el) => el.EmailAddress === email
        );

        returnValue.CurrentEmploymentStartDate = new Date(
            returnValue.CurrentEmploymentStartDate
        );

        returnValue.BirthDate = new Date(returnValue.BirthDate);

        returnValue.PassportExpirationDate = new Date(
            returnValue.PassportExpirationDate
        );

        returnValue.PassportIssueDate = new Date(returnValue.PassportIssueDate);

        returnValue.CitizenshipStartDate = new Date(
            returnValue.CitizenshipStartDate
        );

        return returnValue;
    }

    private _formatEmailData(): any {
        const emailData: any = EmailData;
        const formattedData = [];

        /* Format the JSON into a better format */
        // eslint-disable-next-line guard-for-in
        for (const key in emailData) {
            if (!(key === 'length' || key === 'default')) {
                const to = emailData[key].To;
                emailData[key].Date = new Date(emailData[key].Date);
                const toArray = [];
                to.split(', ').forEach((el) => {
                    toArray.push(el);
                });
                emailData[key].To = toArray;
                formattedData.push(emailData[key]);
            }
        }

        // sort formatted data by Date
        formattedData.sort((a, b) => a.Date.getTime() - b.Date.getTime());
        formattedData.map((el) => {
            el.filtered = el.filtered.split(',');
        });
        return formattedData;
    }

    private _formatEmployeeData(): any {
        const employeeData: any = EmployeeData;
        const formattedData = [];

        /* Format the JSON into a better format */
        // eslint-disable-next-line guard-for-in
        for (const key in employeeData) {
            if (!(key === 'length' || key === 'default')) {
                formattedData.push(employeeData[key]);
            }
        }

        return formattedData;
    }

    private _formatArticleData(): any {
        const articleData: any = ArticleData;
        const formattedData = [];

        /* Format the JSON into a better format */
        // eslint-disable-next-line guard-for-in
        for (const key in articleData) {
            if (!(key === 'length' || key === 'default')) {
                formattedData.push(articleData[key]);
            }
        }

        return formattedData;
    }

    private _formatEmailDataFormatted(): any {
        // find unique emails
        const uniqueEmails = this.emailData.reduce((acc, curr) => {
            if (acc.indexOf(curr.From) === -1) {
                acc.push(curr.From);
            }

            curr.To.forEach((el) => {
                if (acc.indexOf(el) === -1) {
                    acc.push(el);
                }
            });

            return acc;
        }, []);

        return uniqueEmails;
    }

    private _getUniqueDepts(): any {
        const depts = this.employeeData.reduce((acc, curr) => {
            if (acc.indexOf(curr.CurrentEmploymentType) === -1) {
                acc.push(curr.CurrentEmploymentType);
            }
            return acc;
        }, []);
        return depts;
    }
}
