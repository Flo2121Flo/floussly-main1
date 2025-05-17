import { logger } from '../utils/logger';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface CoverageSummary {
  total: number;
  covered: number;
  percentage: number;
}

interface FileCoverage {
  file: string;
  statements: CoverageSummary;
  branches: CoverageSummary;
  functions: CoverageSummary;
  lines: CoverageSummary;
}

interface CoverageReport {
  timestamp: string;
  summary: {
    statements: CoverageSummary;
    branches: CoverageSummary;
    functions: CoverageSummary;
    lines: CoverageSummary;
  };
  files: FileCoverage[];
  uncoveredFiles: string[];
  lowCoverageFiles: string[];
}

export class TestCoverage {
  private readonly COVERAGE_THRESHOLD = 80; // Minimum coverage percentage
  private readonly LOW_COVERAGE_THRESHOLD = 60; // Threshold for low coverage warning

  async runCoverage(): Promise<CoverageReport> {
    try {
      // Run Jest with coverage
      await execAsync('npm test -- --coverage');

      // Parse coverage report
      const coverageReport = await this.parseCoverageReport();

      // Analyze coverage
      const analysis = this.analyzeCoverage(coverageReport);

      // Generate report
      const report = this.generateReport(coverageReport, analysis);

      // Save report
      await this.saveReport(report);

      return report;
    } catch (error) {
      logger.error('Error running coverage:', error);
      throw error;
    }
  }

  private async parseCoverageReport(): Promise<any> {
    const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
    const coverageData = JSON.parse(fs.readFileSync(coveragePath, 'utf-8'));

    return coverageData;
  }

  private analyzeCoverage(coverageData: any): {
    uncoveredFiles: string[];
    lowCoverageFiles: string[];
  } {
    const uncoveredFiles: string[] = [];
    const lowCoverageFiles: string[] = [];

    Object.entries(coverageData).forEach(([file, data]: [string, any]) => {
      if (file === 'total') return;

      const coverage = data.lines.pct;
      if (coverage === 0) {
        uncoveredFiles.push(file);
      } else if (coverage < this.LOW_COVERAGE_THRESHOLD) {
        lowCoverageFiles.push(file);
      }
    });

    return { uncoveredFiles, lowCoverageFiles };
  }

  private generateReport(
    coverageData: any,
    analysis: { uncoveredFiles: string[]; lowCoverageFiles: string[] }
  ): CoverageReport {
    const files: FileCoverage[] = [];
    const total = coverageData.total;

    Object.entries(coverageData).forEach(([file, data]: [string, any]) => {
      if (file === 'total') return;

      files.push({
        file,
        statements: {
          total: data.statements.total,
          covered: data.statements.covered,
          percentage: data.statements.pct,
        },
        branches: {
          total: data.branches.total,
          covered: data.branches.covered,
          percentage: data.branches.pct,
        },
        functions: {
          total: data.functions.total,
          covered: data.functions.covered,
          percentage: data.functions.pct,
        },
        lines: {
          total: data.lines.total,
          covered: data.lines.covered,
          percentage: data.lines.pct,
        },
      });
    });

    return {
      timestamp: new Date().toISOString(),
      summary: {
        statements: {
          total: total.statements.total,
          covered: total.statements.covered,
          percentage: total.statements.pct,
        },
        branches: {
          total: total.branches.total,
          covered: total.branches.covered,
          percentage: total.branches.pct,
        },
        functions: {
          total: total.functions.total,
          covered: total.functions.covered,
          percentage: total.functions.pct,
        },
        lines: {
          total: total.lines.total,
          covered: total.lines.covered,
          percentage: total.lines.pct,
        },
      },
      files,
      uncoveredFiles: analysis.uncoveredFiles,
      lowCoverageFiles: analysis.lowCoverageFiles,
    };
  }

  private async saveReport(report: CoverageReport): Promise<void> {
    const reportPath = path.join(process.cwd(), 'coverage', 'coverage-report.json');
    await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2));
  }

  async checkCoverageThreshold(): Promise<boolean> {
    const report = await this.runCoverage();
    const meetsThreshold = report.summary.lines.percentage >= this.COVERAGE_THRESHOLD;

    if (!meetsThreshold) {
      logger.warn(
        `Coverage threshold not met. Current coverage: ${report.summary.lines.percentage}%, Required: ${this.COVERAGE_THRESHOLD}%`
      );
    }

    return meetsThreshold;
  }

  async generateCoverageBadge(): Promise<void> {
    const report = await this.runCoverage();
    const coverage = report.summary.lines.percentage;
    const color = this.getBadgeColor(coverage);

    const badge = `![Coverage](https://img.shields.io/badge/coverage-${coverage}%25-${color})`;
    const readmePath = path.join(process.cwd(), 'README.md');

    let readme = await fs.promises.readFile(readmePath, 'utf-8');
    readme = readme.replace(
      /!\[Coverage\].*/,
      badge
    );

    await fs.promises.writeFile(readmePath, readme);
  }

  private getBadgeColor(coverage: number): string {
    if (coverage >= 90) return 'brightgreen';
    if (coverage >= 80) return 'green';
    if (coverage >= 70) return 'yellowgreen';
    if (coverage >= 60) return 'yellow';
    if (coverage >= 50) return 'orange';
    return 'red';
  }

  async generateCoverageReport(): Promise<string> {
    const report = await this.runCoverage();
    const { summary, files, uncoveredFiles, lowCoverageFiles } = report;

    return `
# Test Coverage Report

## Summary
- Statements: ${summary.statements.percentage}%
- Branches: ${summary.branches.percentage}%
- Functions: ${summary.functions.percentage}%
- Lines: ${summary.lines.percentage}%

## Files with Low Coverage
${lowCoverageFiles.map(file => `- ${file}`).join('\n')}

## Uncovered Files
${uncoveredFiles.map(file => `- ${file}`).join('\n')}

## Detailed Coverage
${files
  .map(
    file => `
### ${file.file}
- Statements: ${file.statements.percentage}%
- Branches: ${file.branches.percentage}%
- Functions: ${file.functions.percentage}%
- Lines: ${file.lines.percentage}%
`
  )
  .join('\n')}
    `;
  }
} 