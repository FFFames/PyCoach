import { Assignment, Mastery, Submission } from "./types";

export const assignments: Assignment[] = [
 {id:"variables",title:"The Tip Splitter",description:"Read a bill total and number of people, then print each person's share rounded to two decimal places.",starterCode:'bill = float(input())\npeople = int(input())\n\n# Calculate and print each person\'s share\n',difficulty:"Beginner",skill:"variables",tests:[{input:"100\n4",expected:"25.00"},{input:"87.5\n5",expected:"17.50"}]},
 {id:"conditionals",title:"Ticket Booth",description:"Read an age. Print child for ages under 13, teen for ages 13–17, and adult otherwise.",starterCode:'age = int(input())\n\n# Print the correct ticket category\n',difficulty:"Beginner",skill:"conditionals",tests:[{input:"8",expected:"child"},{input:"15",expected:"teen"},{input:"24",expected:"adult"}]},
 {id:"loops",title:"Fizz Counter",description:"Read n and print the sum of every integer from 1 through n.",starterCode:'n = int(input())\n\n# Use a loop to calculate the total\n',difficulty:"Beginner",skill:"loops",tests:[{input:"5",expected:"15"},{input:"10",expected:"55"}]},
 {id:"lists",title:"Above Average",description:"Read space-separated integers and print how many values are greater than their average.",starterCode:'numbers = list(map(int, input().split()))\n\n# Count values above the average\n',difficulty:"Intermediate",skill:"lists",tests:[{input:"1 2 3 4 5",expected:"2"},{input:"10 10 20",expected:"1"}]},
 {id:"functions",title:"Palindrome Lab",description:"Write is_palindrome(text), then read a word and print True or False. Ignore letter case.",starterCode:'def is_palindrome(text):\n    # Return whether text reads the same backwards\n    pass\n\nword = input()\nprint(is_palindrome(word))\n',difficulty:"Intermediate",skill:"functions",tests:[{input:"Racecar",expected:"True"},{input:"Python",expected:"False"}]}
];

export const demoMastery: Mastery = {variables:.82,conditionals:.68,loops:.44,lists:.31,functions:.25};
export const demoSubmissions: Submission[] = [
 {id:"s1",studentId:"demo-student",studentName:"Maya Chen",assignmentId:"variables",assignmentTitle:"The Tip Splitter",skill:"variables",grade:100,feedback:"All tests passed.",submittedAt:"2026-06-30T09:42:00Z"},
 {id:"s2",studentId:"student-2",studentName:"Noah Williams",assignmentId:"loops",assignmentTitle:"Fizz Counter",skill:"loops",grade:50,feedback:"1 of 2 tests passed.",submittedAt:"2026-06-30T08:15:00Z"},
 {id:"s3",studentId:"demo-student",studentName:"Maya Chen",assignmentId:"conditionals",assignmentTitle:"Ticket Booth",skill:"conditionals",grade:100,feedback:"All tests passed.",submittedAt:"2026-06-29T14:06:00Z"}
];
