import { User, Book, UserBookInteraction, Challenge, Badge, MonthlyTheme } from './types';

export interface SqlResult {
  success: boolean;
  message: string;
  rows?: any[];
}

export function executeVirtualSQL(
  query: string,
  state: {
    users: User[];
    books: Book[];
    interactions: UserBookInteraction[];
    challenges: Challenge[];
    theme: MonthlyTheme;
    badges: Badge[];
  },
  updateState: (newState: Partial<typeof state>) => void
): SqlResult {
  const cleanQuery = query.trim().replace(/;$/, '');
  const lowerQuery = cleanQuery.toLowerCase();

  try {
    // SELECT * FROM Users
    if (lowerQuery.startsWith('select * from users')) {
      return {
        success: true,
        message: `SELECT * FROM Users returned ${state.users.length} rows successfully.`,
        rows: state.users,
      };
    }

    // SELECT * FROM Books
    if (lowerQuery.startsWith('select * from books')) {
      return {
        success: true,
        message: `SELECT * FROM Books returned ${state.books.length} rows successfully.`,
        rows: state.books,
      };
    }

    // SELECT * FROM User_Book_Interactions
    if (lowerQuery.startsWith('select * from user_book_interactions') || lowerQuery.startsWith('select * from interactions')) {
      return {
        success: true,
        message: `SELECT * FROM User_Book_Interactions returned ${state.interactions.length} rows successfully.`,
        rows: state.interactions,
      };
    }

    // SELECT * FROM Challenges
    if (lowerQuery.startsWith('select * from challenges')) {
      return {
        success: true,
        message: `SELECT * FROM Challenges returned ${state.challenges.length} rows successfully.`,
        rows: state.challenges,
      };
    }

    // UPDATE Users SET Total_Points = X WHERE User_ID = Y
    if (lowerQuery.startsWith('update users')) {
      const xpMatch = cleanQuery.match(/set\s+total_points\s*=\s*(\d+)/i);
      const idMatch = cleanQuery.match(/where\s+user_id\s*=\s*(\d+)/i);
      
      if (xpMatch && idMatch) {
        const newXp = parseInt(xpMatch[1]);
        const userId = parseInt(idMatch[1]);
        const userExists = state.users.some(u => u.User_ID === userId);
        
        if (!userExists) {
          return { success: false, message: `Error: User with User_ID = ${userId} not found.` };
        }

        const newUsers = state.users.map(u => 
          u.User_ID === userId ? { ...u, Total_Points: newXp } : u
        );
        updateState({ users: newUsers });
        return {
          success: true,
          message: `UPDATE Users SET Total_Points = ${newXp} WHERE User_ID = ${userId} (1 row affected).`
        };
      }
    }

    // UPDATE Users SET Full_Name = 'X', Grade_Class = 'Y' WHERE User_ID = Z
    if (lowerQuery.startsWith('update users') && cleanQuery.includes('full_name')) {
      const nameMatch = cleanQuery.match(/full_name\s*=\s*['"]([^'"]+)['"]/i);
      const classMatch = cleanQuery.match(/grade_class\s*=\s*['"]([^'"]+)['"]/i);
      const idMatch = cleanQuery.match(/where\s+user_id\s*=\s*(\d+)/i);

      if (idMatch) {
        const userId = parseInt(idMatch[1]);
        const user = state.users.find(u => u.User_ID === userId);
        if (!user) {
          return { success: false, message: `Error: User with User_ID = ${userId} not found.` };
        }

        const newUsers = state.users.map(u => {
          if (u.User_ID === userId) {
            return {
              ...u,
              Full_Name: nameMatch ? nameMatch[1] : u.Full_Name,
              Grade_Class: classMatch ? classMatch[1] : u.Grade_Class
            };
          }
          return u;
        });
        updateState({ users: newUsers });
        return {
          success: true,
          message: `UPDATE Users SET info WHERE User_ID = ${userId} (1 row affected).`
        };
      }
    }

    // UPDATE Challenges SET Current = X WHERE Challenge_ID = Y
    if (lowerQuery.startsWith('update challenges')) {
      const curMatch = cleanQuery.match(/set\s+current\s*=\s*(\d+)/i);
      const idMatch = cleanQuery.match(/where\s+challenge_id\s*=\s*(\d+)/i);

      if (curMatch && idMatch) {
        const currentVal = parseInt(curMatch[1]);
        const challengeId = parseInt(idMatch[1]);
        const ch = state.challenges.find(c => c.Challenge_ID === challengeId);

        if (!ch) {
          return { success: false, message: `Error: Challenge with Challenge_ID = ${challengeId} not found.` };
        }

        const newChallenges = state.challenges.map(c => {
          if (c.Challenge_ID === challengeId) {
            const completed = currentVal >= c.Target;
            return { ...c, Current: currentVal, Completed: completed };
          }
          return c;
        });

        updateState({ challenges: newChallenges });
        return {
          success: true,
          message: `UPDATE Challenges SET Current = ${currentVal} WHERE Challenge_ID = ${challengeId} (1 row affected).`
        };
      }
    }

    // INSERT INTO Books (Title, Author, Category, Target_Grade, Book_Type, Cover_Image) VALUES ('...', '...', '...', '...', '...', '...')
    if (lowerQuery.startsWith('insert into books')) {
      // Basic insert fallback or random title
      const valuesStr = cleanQuery.match(/values\s*\((.+)\)/i);
      if (valuesStr) {
        const parts = valuesStr[1].split(',').map(p => p.trim().replace(/^['"]|['"]$/g, ''));
        if (parts.length >= 2) {
          const newId = state.books.length > 0 ? Math.max(...state.books.map(b => b.Book_ID)) + 1 : 1;
          const newBook: Book = {
            Book_ID: newId,
            Title: parts[0] || 'Sách mới nhập',
            Author: parts[1] || 'Tác giả khuyết danh',
            Category: parts[2] || 'Khoa học',
            Target_Grade: parts[3] || 'Lớp 4-5',
            Book_Type: (parts[4] as 'Ebook' | 'Audio') || 'Ebook',
            Cover_Image: parts[5] || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
            Content_URL: '#'
          };

          updateState({ books: [...state.books, newBook] });
          return {
            success: true,
            message: `INSERT INTO Books VALUES (${newId}, '${newBook.Title}') successfully (1 row affected).`
          };
        }
      }
    }

    // DELETE FROM Books WHERE Book_ID = X
    if (lowerQuery.startsWith('delete from books')) {
      const idMatch = cleanQuery.match(/where\s+book_id\s*=\s*(\d+)/i);
      if (idMatch) {
        const bookId = parseInt(idMatch[1]);
        const bookExists = state.books.some(b => b.Book_ID === bookId);
        if (!bookExists) {
          return { success: false, message: `Error: Book with Book_ID = ${bookId} not found.` };
        }

        const newBooks = state.books.filter(b => b.Book_ID !== bookId);
        updateState({ books: newBooks });
        return {
          success: true,
          message: `DELETE FROM Books WHERE Book_ID = ${bookId} successfully (1 row affected).`
        };
      }
    }

    // DELETE FROM Users WHERE User_ID = X
    if (lowerQuery.startsWith('delete from users')) {
      const idMatch = cleanQuery.match(/where\s+user_id\s*=\s*(\d+)/i);
      if (idMatch) {
        const userId = parseInt(idMatch[1]);
        const userExists = state.users.some(u => u.User_ID === userId);
        if (!userExists) {
          return { success: false, message: `Error: User with User_ID = ${userId} not found.` };
        }

        const newUsers = state.users.filter(u => u.User_ID !== userId);
        updateState({ users: newUsers });
        return {
          success: true,
          message: `DELETE FROM Users WHERE User_ID = ${userId} successfully (1 row affected).`
        };
      }
    }

    return {
      success: false,
      message: `Syntax Error: Unsupported command or statement format. Available: SELECT * FROM [Users/Books/Challenges], UPDATE Users SET Total_Points=X WHERE User_ID=Y, INSERT INTO Books VALUES ('Title', 'Author', ...), DELETE FROM Books WHERE Book_ID=X.`
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Database SQL Error: ${err.message}`
    };
  }
}
