/**
 * CAMPUS BIRTHDAY HUB - CALENDAR & BIRTHDAY LOGIC MODULE
 * 
 * Handles accurate birthday calculations, leap years, countdowns,
 * monthly calendar grid generation, and upcoming celebration lists.
 */

class BirthdayCalendar {
    constructor() {
        this.currentDate = new Date();
        this.viewYear = this.currentDate.getFullYear();
        this.viewMonth = this.currentDate.getMonth(); // 0-11
        this.students = [];
        this.activeFilter = {
            search: '',
            department: '',
            batch: '',
            month: 'all',
            viewMode: 'grid' // 'grid' or 'list'
        };
    }

    // Set students data
    setStudents(students) {
        this.students = students || [];
    }

    // Is a year a leap year?
    isLeapYear(year) {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
    }

    // Parse birthday string into { month: 1-12, day: 1-31, year: number | null }
    parseBirthday(dateString) {
        if (!dateString) return null;
        const parts = dateString.split('-');
        if (parts.length === 3) {
            return {
                year: parseInt(parts[0], 10),
                month: parseInt(parts[1], 10),
                day: parseInt(parts[2], 10)
            };
        } else if (parts.length === 2) {
            return {
                year: null,
                month: parseInt(parts[0], 10),
                day: parseInt(parts[1], 10)
            };
        }
        return null;
    }

    // Calculate days until next birthday, next birthday date, and age milestone (if year provided)
    calculateNextBirthday(dateString) {
        const parsed = this.parseBirthday(dateString);
        if (!parsed) return null;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const currentYear = today.getFullYear();
        let targetDay = parsed.day;
        let targetMonth = parsed.month - 1; // 0-11 for JS Date

        // Leap year handling: if born Feb 29 and target year is not leap, celebrate Feb 28
        let dayForCurrentYear = targetDay;
        if (parsed.month === 2 && targetDay === 29 && !this.isLeapYear(currentYear)) {
            dayForCurrentYear = 28;
        }

        let nextBirthdayDate = new Date(currentYear, targetMonth, dayForCurrentYear);
        nextBirthdayDate.setHours(0, 0, 0, 0);

        let turnsAge = null;
        let bdayYear = currentYear;

        // If birthday has already passed this year, it falls in next year
        if (nextBirthdayDate < today) {
            bdayYear = currentYear + 1;
            let dayForNextYear = targetDay;
            if (parsed.month === 2 && targetDay === 29 && !this.isLeapYear(bdayYear)) {
                dayForNextYear = 28;
            }
            nextBirthdayDate = new Date(bdayYear, targetMonth, dayForNextYear);
            nextBirthdayDate.setHours(0, 0, 0, 0);
        }

        const diffTime = nextBirthdayDate - today;
        const daysUntil = Math.round(diffTime / (1000 * 60 * 60 * 24));

        if (parsed.year) {
            turnsAge = bdayYear - parsed.year;
        }

        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

        return {
            daysUntil,
            isToday: daysUntil === 0,
            isTomorrow: daysUntil === 1,
            isThisWeek: daysUntil >= 0 && daysUntil <= 7,
            isThisMonth: nextBirthdayDate.getMonth() === today.getMonth() && nextBirthdayDate.getFullYear() === today.getFullYear(),
            formattedDate: `${monthNames[targetMonth]} ${targetDay}`,
            shortDate: `${shortMonths[targetMonth]} ${targetDay}`,
            month: parsed.month,
            day: targetDay,
            originalYear: parsed.year,
            turnsAge,
            nextDate: nextBirthdayDate
        };
    }

    // Get all students decorated with birthday calculations, sorted by upcoming days
    getProcessedStudents() {
        return this.students
            .map(student => {
                const bdayInfo = this.calculateNextBirthday(student.birthday_date);
                return {
                    ...student,
                    bday: bdayInfo
                };
            })
            .filter(item => item.bday !== null)
            .sort((a, b) => a.bday.daysUntil - b.bday.daysUntil);
    }

    // Filter students by search query, department, batch, and month
    filterStudents(processedList) {
        return processedList.filter(s => {
            // Search text
            if (this.activeFilter.search) {
                const q = this.activeFilter.search.toLowerCase().trim();
                const name = (s.full_name || '').toLowerCase();
                const pref = (s.preferred_name || '').toLowerCase();
                const reg = (s.student_id || '').toLowerCase();
                if (!name.includes(q) && !pref.includes(q) && !reg.includes(q)) {
                    return false;
                }
            }

            // Department
            if (this.activeFilter.department && s.department !== this.activeFilter.department) {
                return false;
            }

            // Batch
            if (this.activeFilter.batch && s.batch !== this.activeFilter.batch) {
                return false;
            }

            // Month (1-12 or 'all')
            if (this.activeFilter.month !== 'all') {
                const m = parseInt(this.activeFilter.month, 10);
                if (s.bday.month !== m) {
                    return false;
                }
            }

            return true;
        });
    }

    // Categorized celebrations
    getCelebrationGroups() {
        const processed = this.getProcessedStudents();
        const filtered = this.filterStudents(processed);

        const todayBirthdays = filtered.filter(s => s.bday.isToday);
        const thisWeekBirthdays = filtered.filter(s => !s.bday.isToday && s.bday.isThisWeek);
        const thisMonthBirthdays = filtered.filter(s => !s.bday.isToday && !s.bday.isThisWeek && s.bday.isThisMonth);
        const upcomingAll = filtered;

        return {
            today: todayBirthdays,
            thisWeek: thisWeekBirthdays,
            thisMonth: thisMonthBirthdays,
            allUpcoming: upcomingAll
        };
    }

    // Month Navigation
    nextMonth() {
        this.viewMonth++;
        if (this.viewMonth > 11) {
            this.viewMonth = 0;
            this.viewYear++;
        }
    }

    prevMonth() {
        this.viewMonth--;
        if (this.viewMonth < 0) {
            this.viewMonth = 11;
            this.viewYear--;
        }
    }

    resetToCurrentMonth() {
        this.viewYear = this.currentDate.getFullYear();
        this.viewMonth = this.currentDate.getMonth();
    }

    // Generate days grid for viewYear & viewMonth
    getMonthGridDays() {
        const firstDay = new Date(this.viewYear, this.viewMonth, 1);
        const lastDay = new Date(this.viewYear, this.viewMonth + 1, 0);

        // Day of week for first day (0 = Sunday, 1 = Monday, etc.)
        let startingDayOfWeek = firstDay.getDay(); // 0 is Sunday
        const totalDays = lastDay.getDate();

        // Previous month filler days
        const prevMonthLastDay = new Date(this.viewYear, this.viewMonth, 0).getDate();
        const prevMonthDays = [];
        for (let i = startingDayOfWeek - 1; i >= 0; i--) {
            prevMonthDays.push({
                day: prevMonthLastDay - i,
                isCurrentMonth: false,
                isPrevMonth: true,
                month: this.viewMonth === 0 ? 12 : this.viewMonth,
                year: this.viewMonth === 0 ? this.viewYear - 1 : this.viewYear
            });
        }

        // Current month days
        const currentMonthDays = [];
        const today = new Date();
        const currentMonthNum = this.viewMonth + 1; // 1-12

        // Find birthdays falling in this view month
        const processed = this.getProcessedStudents();
        const filtered = this.filterStudents(processed);

        for (let d = 1; d <= totalDays; d++) {
            const isToday = (
                today.getFullYear() === this.viewYear &&
                today.getMonth() === this.viewMonth &&
                today.getDate() === d
            );

            // Students born on this day and month
            const dayStudents = filtered.filter(s => {
                if (s.bday.month !== currentMonthNum) return false;
                // Handle leap year birthday on Feb 29 in non-leap year
                if (currentMonthNum === 2 && s.bday.day === 29 && !this.isLeapYear(this.viewYear)) {
                    return d === 28;
                }
                return s.bday.day === d;
            });

            currentMonthDays.push({
                day: d,
                isCurrentMonth: true,
                isToday,
                month: currentMonthNum,
                year: this.viewYear,
                students: dayStudents
            });
        }

        // Next month filler days to complete 35 or 42 grid cells
        const totalFilled = prevMonthDays.length + currentMonthDays.length;
        const totalCellsNeeded = totalFilled > 35 ? 42 : 35;
        const nextMonthDays = [];
        const nextCount = totalCellsNeeded - totalFilled;
        for (let n = 1; n <= nextCount; n++) {
            nextMonthDays.push({
                day: n,
                isCurrentMonth: false,
                isNextMonth: true,
                month: this.viewMonth === 11 ? 1 : this.viewMonth + 2,
                year: this.viewMonth === 11 ? this.viewYear + 1 : this.viewYear
            });
        }

        return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
    }

    // Get current month name
    getViewMonthName() {
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        return `${monthNames[this.viewMonth]} ${this.viewYear}`;
    }
}

window.birthdayCalendar = new BirthdayCalendar();

