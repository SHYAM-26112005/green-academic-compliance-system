import { useState, useEffect, useMemo } from 'react';
import { FileDown, FileText, Download, Calendar, ArrowRight, FileCheck, FileSpreadsheet, FileClock, Loader2, CheckCircle2, AlertCircle, X, Search, Filter, RotateCcw } from 'lucide-react';
import clsx from 'clsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface GeneratedReport {
    _id?: string;
    name: string;
    type: 'PDF' | 'Excel' | 'CSV';
    reportType: string;
    dateRange: string;
    size: string;
    date: string;
}

interface ComplianceRecord {
    _id: string;
    department: string;
    category: string;
    description: string;
    score: number;
    status: string;
    date: string;
}

const ReportsGenerator = () => {
    const [reportType, setReportType] = useState('Sustainability Overview');
    const [dateRange, setDateRange] = useState('Last 30 Days');
    const [format, setFormat] = useState('PDF');
    const [reports, setReports] = useState<GeneratedReport[]>([]);
    const [fetching, setFetching] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);
    
    // Modal & Filter State
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('All Formats');
    const [categoryFilter, setCategoryFilter] = useState('All Types');

    const API_URL = '/api/generated-reports';
    const COMPLIANCE_API = '/api/reports';

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setFetching(true);
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Failed to fetch report history');
            const data = await response.json();
            setReports(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setFetching(false);
        }
    };

    const getFilteredComplianceData = async (range: string, type: string) => {
        const response = await fetch(COMPLIANCE_API);
        if (!response.ok) throw new Error('Data retrieval failed. Please check connection.');
        const allRecords: ComplianceRecord[] = await response.json();

        const now = new Date();
        let cutoffDate = new Date();

        if (range === 'Last 7 Days') cutoffDate.setDate(now.getDate() - 7);
        else if (range === 'Last 30 Days') cutoffDate.setDate(now.getDate() - 30);
        else if (range === 'Last 6 Months') cutoffDate.setMonth(now.getMonth() - 6);
        else if (range === 'Last Year') cutoffDate.setFullYear(now.getFullYear() - 1);

        let filtered = allRecords.filter(record => new Date(record.date) >= cutoffDate);

        if (type === 'Energy Report') filtered = filtered.filter(r => r.category === 'Energy');
        else if (type === 'Waste Report') filtered = filtered.filter(r => r.category === 'Waste');
        else if (type === 'Water Report') filtered = filtered.filter(r => r.category === 'Water');

        return filtered;
    };

    const generatePDF = (title: string, range: string, data: ComplianceRecord[]) => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.setTextColor(22, 101, 52);
        doc.text(title, 14, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Period: ${range}`, 14, 28);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 33);
        doc.text(`Records Found: ${data.length}`, 14, 38);
        
        const tableBody = data.map(r => [
            r.date,
            r.department,
            r.category,
            r.score.toString(),
            r.status
        ]);

        autoTable(doc, {
            startY: 45,
            head: [['Date', 'Dept', 'Category', 'Score', 'Status']],
            body: tableBody.length > 0 ? tableBody : [['No data', '-', '-', '-', '-']],
            theme: 'striped',
            headStyles: { fillColor: [22, 101, 52], textColor: [255, 255, 255] },
            alternateRowStyles: { fillColor: [240, 253, 244] }
        });
        
        doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
    };

    const generateExcel = (title: string, range: string, data: ComplianceRecord[]) => {
        const excelRows = [
            ['Environmental Compliance Report', '', '', '', ''],
            ['Report Type:', title, '', '', ''],
            ['Date Range:', range, '', '', ''],
            ['Generated on:', new Date().toLocaleString(), '', '', ''],
            ['Records Count:', data.length.toString(), '', '', ''],
            ['', '', '', '', ''],
            ['Date', 'Department', 'Category', 'Score', 'Status']
        ];

        data.forEach(r => {
            excelRows.push([r.date, r.department, r.category, r.score.toString(), r.status]);
        });

        if (data.length === 0) {
            excelRows.push(['No data found for this period', '', '', '', '']);
        }

        const ws = XLSX.utils.aoa_to_sheet(excelRows);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Compliance Data");
        XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`);
    };

    const handleGenerate = async () => {
        setGenerating(true);
        setError('');
        setShowSuccess(false);

        try {
            const newReportMetadata = {
                name: `${reportType} - ${dateRange}`,
                type: format as any,
                reportType,
                dateRange,
                size: `${(Math.random() * 2 + 1).toFixed(1)} MB`,
                date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            };

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newReportMetadata)
            });

            if (!response.ok) throw new Error('Failed to save report record');
            const savedReport = await response.json();
            
            setReports(prev => [savedReport, ...prev]);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setGenerating(false);
        }
    };

    const handleDownloadHistory = async (report: GeneratedReport) => {
        if (!report._id) return;
        try {
            setDownloadingId(report._id);
            setError('');
            const filteredData = await getFilteredComplianceData(report.dateRange, report.reportType);
            
            if (report.type === 'PDF') {
                generatePDF(report.reportType, report.dateRange, filteredData);
            } else if (report.type === 'Excel') {
                generateExcel(report.reportType, report.dateRange, filteredData);
            }
        } catch (err: any) {
            setError(`Download failed: ${err.message}`);
        } finally {
            setDownloadingId(null);
        }
    };

    const clearFilters = () => {
        setSearchQuery('');
        setTypeFilter('All Formats');
        setCategoryFilter('All Types');
    };

    const getIcon = (type: string) => {
        if (type === 'PDF') return FileCheck;
        if (type === 'Excel' || type === 'CSV') return FileSpreadsheet;
        return FileClock;
    };

    const filteredHistory = useMemo(() => {
        return reports.filter(r => {
            const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 r.reportType.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = typeFilter === 'All Formats' || r.type === typeFilter;
            const matchesCategory = categoryFilter === 'All Types' || r.reportType === categoryFilter;
            
            return matchesSearch && matchesType && matchesCategory;
        });
    }, [reports, searchQuery, typeFilter, categoryFilter]);

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Card 1: Generate Report */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-100 flex flex-col hover:shadow-md transition-shadow">
                    <div className="flex items-center mb-6">
                        <div className="p-3 bg-green-100 rounded-xl text-green-700 mr-4">
                            <FileText size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Generate Report</h2>
                            <p className="text-sm text-gray-500">Customize your compliance data output.</p>
                        </div>
                    </div>

                    <div className="space-y-6 flex-1">
                        {/* Report Type */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Report Type</label>
                            <select 
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                                disabled={generating}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all disabled:opacity-50"
                            >
                                <option>Sustainability Overview</option>
                                <option>Waste Report</option>
                                <option>Energy Report</option>
                                <option>Water Report</option>
                            </select>
                        </div>

                        {/* Date Range */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Date Range</label>
                            <div className="relative">
                                <select 
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value)}
                                    disabled={generating}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all appearance-none disabled:opacity-50"
                                >
                                    <option>Last 7 Days</option>
                                    <option>Last 30 Days</option>
                                    <option>Last 6 Months</option>
                                    <option>Last Year</option>
                                </select>
                                <Calendar className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" size={18} />
                            </div>
                        </div>

                        {/* Format Selection */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Format</label>
                            <div className="flex gap-6">
                                {['PDF', 'Excel'].map((f) => (
                                    <label key={f} className="flex items-center cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input 
                                                type="radio" 
                                                name="format" 
                                                value={f}
                                                checked={format === f}
                                                onChange={() => setFormat(f)}
                                                disabled={generating}
                                                className="sr-only"
                                            />
                                            <div className={clsx(
                                                "w-5 h-5 rounded-full border-2 transition-all",
                                                format === f ? "border-green-600 bg-green-600" : "border-gray-300 group-hover:border-green-400",
                                                generating && "opacity-50 cursor-not-allowed"
                                            )} />
                                            {format === f && <div className="absolute w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        <span className={clsx(
                                            "ml-3 text-sm font-medium transition-colors",
                                            format === f ? "text-gray-900" : "text-gray-500 group-hover:text-green-600",
                                            generating && "opacity-50 cursor-not-allowed"
                                        )}>{f}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 p-3 bg-red-50 rounded-lg flex items-center text-red-600 animate-in fade-in duration-300">
                            <AlertCircle size={14} className="mr-2 shrink-0" />
                            <span className="text-xs font-medium">{error}</span>
                        </div>
                    )}
                    
                    {showSuccess && (
                            <div className="mt-4 flex items-center justify-center text-green-700 animate-in fade-in slide-in-from-top-2 duration-300">
                                <CheckCircle2 size={16} className="mr-2" />
                                <span className="text-sm font-medium">Report added to list!</span>
                            </div>
                    )}

                    <button 
                        onClick={handleGenerate}
                        disabled={generating}
                        className="w-full mt-8 bg-green-700 text-white rounded-xl py-4 font-bold flex items-center justify-center hover:bg-green-800 transition-all shadow-lg shadow-green-900/10 active:scale-[0.98] disabled:opacity-70"
                    >
                        {generating && !downloadingId ? (
                            <>
                                <Loader2 className="animate-spin mr-2" size={18} />
                                Creating...
                            </>
                        ) : (
                            <>
                                Generate Report
                                <ArrowRight size={18} className="ml-2" />
                            </>
                        )}
                    </button>
                </div>

                {/* Card 2: Recent Reports */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-green-100 flex flex-col hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-xl text-green-700 mr-4">
                                <FileDown size={24} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Recent Reports</h2>
                        </div>
                        <button 
                            onClick={() => setIsHistoryModalOpen(true)}
                            className="text-sm font-semibold text-green-700 hover:text-green-800 transition-colors"
                        >
                            View All
                        </button>
                    </div>

                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {fetching ? (
                            <div className="py-12 flex flex-col items-center text-gray-400">
                                <Loader2 className="animate-spin mb-3 text-green-600" size={32} />
                                <p className="text-sm">Fetching history...</p>
                            </div>
                        ) : reports.length === 0 ? (
                            <div className="py-12 text-center text-gray-400 italic text-sm border-2 border-dashed border-gray-100 rounded-2xl">
                                No reports generated yet.
                            </div>
                        ) : (
                            reports.slice(0, 5).map((report) => {
                                const Icon = getIcon(report.type);
                                const isDownloading = downloadingId === report._id;
                                return (
                                    <div key={report._id} className="group p-4 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all flex items-center justify-between">
                                        <div className="flex items-center overflow-hidden">
                                            <div className="p-2.5 bg-gray-50 rounded-lg text-gray-400 group-hover:bg-white group-hover:text-green-600 transition-colors shrink-0">
                                                <Icon size={20} />
                                            </div>
                                            <div className="ml-4 truncate">
                                                <h3 className="text-sm font-bold text-gray-900 truncate">{report.name}</h3>
                                                <div className="flex items-center mt-0.5 space-x-3 text-xs text-gray-500">
                                                    <span>{report.date}</span>
                                                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                                    <span>{report.size}</span>
                                                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                                    <span className="font-medium text-green-700">{report.type}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDownloadHistory(report)}
                                            className={clsx(
                                                "ml-4 p-2 rounded-lg transition-all",
                                                isDownloading ? "text-green-600 bg-green-50" : "text-gray-400 hover:text-green-700 hover:bg-white"
                                            )}
                                            title="Download"
                                            disabled={!!downloadingId || generating}
                                        >
                                            {isDownloading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {/* History Modal */}
            {isHistoryModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-green-950/40 backdrop-blur-sm transition-opacity" 
                        onClick={() => setIsHistoryModalOpen(false)}
                    />
                    
                    {/* Modal Content */}
                    <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div className="flex items-center">
                                <div className="p-3 bg-green-100 rounded-xl text-green-700 mr-4">
                                    <FileClock size={24} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900">Report History</h2>
                                    <p className="text-sm text-gray-500">Browse and download all your generated compliance reports.</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsHistoryModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Search & Filters */}
                        <div className="px-8 py-5 bg-gray-50/50 border-b border-gray-100">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                                {/* Search Bar */}
                                <div className="lg:col-span-2 relative">
                                    <Search className="absolute left-4 top-3 text-gray-400" size={18} />
                                    <input 
                                        type="text" 
                                        placeholder="Search by name or type..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none shadow-sm transition-all text-sm"
                                    />
                                </div>

                                {/* Format Filter */}
                                <div className="relative">
                                    <div className="absolute left-4 top-3 text-gray-400 pointer-events-none">
                                        <FileCheck size={18} />
                                    </div>
                                    <select 
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none shadow-sm transition-all text-sm appearance-none"
                                    >
                                        <option>All Formats</option>
                                        <option>PDF</option>
                                        <option>Excel</option>
                                    </select>
                                </div>

                                {/* Category Filter */}
                                <div className="relative">
                                    <div className="absolute left-4 top-3 text-gray-400 pointer-events-none">
                                        <Filter size={18} />
                                    </div>
                                    <select 
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none shadow-sm transition-all text-sm appearance-none"
                                    >
                                        <option>All Types</option>
                                        <option>Sustainability Overview</option>
                                        <option>Waste Report</option>
                                        <option>Energy Report</option>
                                        <option>Water Report</option>
                                    </select>
                                </div>
                            </div>
                            
                            {/* Filter Summary */}
                            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                                <div className="flex items-center gap-2 text-sm text-gray-500 font-medium bg-white px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
                                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    <span>Showing {filteredHistory.length} reports</span>
                                </div>
                                {(searchQuery || typeFilter !== 'All Formats' || categoryFilter !== 'All Types') && (
                                    <button 
                                        onClick={clearFilters}
                                        className="flex items-center gap-2 text-xs font-bold text-green-700 hover:text-green-800 transition-colors uppercase tracking-wider"
                                    >
                                        <RotateCcw size={14} />
                                        Clear All Filters
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Modal Body - Scrollable List */}
                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-gray-50/20">
                            {filteredHistory.length === 0 ? (
                                <div className="py-20 flex flex-col items-center justify-center text-center">
                                    <div className="p-8 bg-white rounded-full text-gray-200 mb-6 shadow-sm">
                                        <Search size={64} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">No matching reports</h3>
                                    <p className="text-sm text-gray-500 max-w-xs mx-auto mt-2">We couldn't find any reports matching your current filter criteria.</p>
                                    <button 
                                        onClick={clearFilters}
                                        className="mt-6 px-6 py-2.5 bg-green-100 text-green-700 font-bold rounded-xl hover:bg-green-200 transition-all"
                                    >
                                        Reset Filters
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {filteredHistory.map((report) => {
                                        const Icon = getIcon(report.type);
                                        const isDownloading = downloadingId === report._id;
                                        return (
                                            <div 
                                                key={report._id} 
                                                className="group p-5 rounded-2xl border border-gray-100 hover:border-green-200 hover:bg-green-50/30 transition-all flex items-center justify-between bg-white shadow-sm hover:shadow-md"
                                            >
                                                <div className="flex items-center overflow-hidden">
                                                    <div className="p-3 bg-gray-50 rounded-xl text-gray-400 group-hover:bg-white group-hover:text-green-600 transition-colors shrink-0">
                                                        <Icon size={24} />
                                                    </div>
                                                    <div className="ml-4 truncate text-left">
                                                        <h3 className="text-sm font-bold text-gray-900 truncate">{report.name}</h3>
                                                        <div className="flex flex-wrap items-center mt-1 gap-x-3 gap-y-1 text-xs text-gray-500">
                                                            <span>{report.date}</span>
                                                            <div className="flex items-center">
                                                                <span className="w-1 h-1 bg-gray-300 rounded-full mr-2" />
                                                                <span>{report.size}</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <span className="w-1 h-1 bg-gray-300 rounded-full mr-2" />
                                                                <span className="font-bold text-green-700">{report.type}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleDownloadHistory(report)}
                                                    className={clsx(
                                                        "ml-4 p-3 rounded-xl transition-all shadow-sm",
                                                        isDownloading ? "text-green-600 bg-green-100" : "text-gray-400 bg-gray-50 hover:text-green-700 hover:bg-white group-hover:bg-white"
                                                    )}
                                                    title="Download"
                                                    disabled={!!downloadingId || generating}
                                                >
                                                    {isDownloading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        
                        {/* Modal Footer */}
                        <div className="px-8 py-6 border-t border-gray-100 bg-white flex justify-end">
                            <button 
                                onClick={() => setIsHistoryModalOpen(false)}
                                className="px-8 py-3 bg-green-700 text-white font-bold rounded-xl hover:bg-green-800 transition-all shadow-lg shadow-green-900/10 active:scale-[0.98]"
                            >
                                Done Viewing
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ReportsGenerator;
