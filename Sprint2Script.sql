-- Remove Users
--Remove the user sean
DELETE FROM Credentials 
WHERE MemberId IN 
    (SELECT MemberID FROM Members WHERE Email='sean@test.com');
DELETE FROM Members 
WHERE Email='sean@test.com';

--Remove the user rin
DELETE FROM Credentials 
WHERE MemberId IN 
    (SELECT MemberID FROM Members WHERE Email='rin@test.com');
DELETE FROM Members 
WHERE Email='rin@test.com';

--Remove the user levi
DELETE FROM Credentials 
WHERE MemberId IN 
    (SELECT MemberID FROM Members WHERE Email='levi@test.com');
DELETE FROM Members 
WHERE Email='levi@test.com';

--Remove the user jenho
DELETE FROM Credentials 
WHERE MemberId IN 
    (SELECT MemberID FROM Members WHERE Email='jenho@test.com');
DELETE FROM Members 
WHERE Email='jenho@test.com';

--Remove the user shilnara
DELETE FROM Credentials 
WHERE MemberId IN 
    (SELECT MemberID FROM Members WHERE Email='shilnara@test.com');
DELETE FROM Members 
WHERE Email='shilnara@test.com';

--Remove the user SlapChat
DELETE FROM Credentials 
WHERE MemberId IN 
    (SELECT MemberID FROM Members WHERE Email='group8tcss450@gmail.com');
DELETE FROM Members 
WHERE Email='group8tcss450@gmail.com';

-- --Remove the user charles
-- DELETE FROM Credentials 
-- WHERE MemberId IN 
--     (SELECT MemberID FROM Members WHERE Email='charles@test.com');
-- DELETE FROM Members 
-- WHERE Email='charles@test.com';



--Add the Users to the  (password is: test12345!)
INSERT INTO 
    Members(FirstName, LastName, Username, Email, Verification)
VALUES
    ('Sean', 'Logan', 'Seans', 'sean@test.com', 1),
    ('Rin', 'Pham', 'Rins', 'rin@test.com', 1),
    ('Shilnara', 'Dam', 'Shilnaras', 'shilnara@test.com', 1),
    ('JenHo', 'Liao', 'JenHos', 'jenho@test.com', 1),
    ('Levi', 'McCoy', 'Levis', 'levi@test.com', 1),
    ('Slap', 'Chat', 'SlapChat', 'group8tcss450@gmail.com', 1);
    -- ('Charles', 'Bryan', 'Charles', 'charles@test.com', 1)


--Adding Crentials for Team
INSERT INTO 
    Credentials(MemberID, SaltedHash, Salt)
VALUES 
((SELECT MemberId FROM Members WHERE Members.Email = 'sean@test.com'),
       '280d79b3e689f56d4ed6e1ee7938116d62b7746e5cede2b3393a805246f2bf27',
       'd7d9409593bf2d71bfa46c729d012557beb4545d54e4b2e8d5814aa22c7fc871'),
((SELECT MemberId FROM Members WHERE Members.Email = 'jenho@test.com'),
       '280d79b3e689f56d4ed6e1ee7938116d62b7746e5cede2b3393a805246f2bf27',
       'd7d9409593bf2d71bfa46c729d012557beb4545d54e4b2e8d5814aa22c7fc871'),
((SELECT MemberId FROM Members WHERE Members.Email = 'levi@test.com'),
       '280d79b3e689f56d4ed6e1ee7938116d62b7746e5cede2b3393a805246f2bf27',
       'd7d9409593bf2d71bfa46c729d012557beb4545d54e4b2e8d5814aa22c7fc871'),
((SELECT MemberId FROM Members WHERE Members.Email = 'shilnara@test.com'),
       '280d79b3e689f56d4ed6e1ee7938116d62b7746e5cede2b3393a805246f2bf27',
       'd7d9409593bf2d71bfa46c729d012557beb4545d54e4b2e8d5814aa22c7fc871'),
((SELECT MemberId FROM Members WHERE Members.Email = 'rin@test.com'),
       '280d79b3e689f56d4ed6e1ee7938116d62b7746e5cede2b3393a805246f2bf27',
       'd7d9409593bf2d71bfa46c729d012557beb4545d54e4b2e8d5814aa22c7fc871'),
((SELECT MemberId FROM Members WHERE Members.Email = 'group8tcss450@gmail.com'),
       '280d79b3e689f56d4ed6e1ee7938116d62b7746e5cede2b3393a805246f2bf27',
       'd7d9409593bf2d71bfa46c729d012557beb4545d54e4b2e8d5814aa22c7fc871');
-- ((SELECT MemberId FROM Members WHERE Members.Email = 'charles@test.com')
--        '280d79b3e689f56d4ed6e1ee7938116d62b7746e5cede2b3393a805246f2bf27'
--        'd7d9409593bf2d71bfa46c729d012557beb4545d54e4b2e8d5814aa22c7fc871')



--Create Chat Rooms
INSERT INTO
    Chats(ChatId, Owner, GroupChat, Name)
VALUES
    (1000, 1, 1, 'Global Chat'),
    (99, 1, 1,'Gaming'),
    (100, 2, 1, 'Studying'),
    (101, 3, 1, 'Coding Questions'),
    (102, 4, 1,'Movies'),
    (103, 5, 1, 'Charles Smack Talk'),
    (104, 1, 1, 'Books'),
    (105, 2, 1,'PC Building'),
    (106, 3, 1, 'Hiking'),
    (107, 4, 1, 'Job Search'),
    (108, 5, 1, 'AMA');

--Add users to the chat 1 GLOBAL
INSERT INTO
    ChatMembers(ChatId, MemberID)
SELECT 1000, Members.MemberId
FROM Members
WHERE Members.Email = 'sean@test.com'
    OR Members.Email = 'rin@test.com'
    OR Members.Email = 'shilnara@test.com'
    OR Members.Email = 'jenho@test.com'
    OR Members.Email = 'levi@test.com';
    -- OR Members.Email = 'charles@test.com';


--Add users to the chat 1 gaming
INSERT INTO
    ChatMembers(ChatId, MemberID)
SELECT 99, Members.MemberId
FROM Members
WHERE Members.Email = 'sean@test.com'
    OR Members.Email = 'rin@test.com'
    OR Members.Email = 'shilnara@test.com'
    OR Members.Email = 'jenho@test.com'
    OR Members.Email = 'levi@test.com';
    -- OR Members.Email = 'charles@test.com';

--Add users to the chat 2 studying
INSERT INTO
    ChatMembers(ChatId, MemberID)
SELECT 100, Members.MemberId
FROM Members
WHERE Members.Email = 'sean@test.com'
    OR Members.Email = 'rin@test.com'
    OR Members.Email = 'shilnara@test.com'
    OR Members.Email = 'jenho@test.com'
    OR Members.Email = 'levi@test.com';
    -- OR Members.Email = 'charles@test.com';

--Add users to the chat 3 coding questions
INSERT INTO
    ChatMembers(ChatId, MemberID)
SELECT 101, Members.MemberId
FROM Members
WHERE Members.Email = 'sean@test.com'
    OR Members.Email = 'rin@test.com'
    OR Members.Email = 'shilnara@test.com'
    OR Members.Email = 'jenho@test.com'
    OR Members.Email = 'levi@test.com';
    -- OR Members.Email = 'charles@test.com';

--Add users to the chat 4 movies
INSERT INTO
    ChatMembers(ChatId, MemberID)
SELECT 102, Members.MemberId
FROM Members
WHERE Members.Email = 'sean@test.com'
    OR Members.Email = 'rin@test.com'
    OR Members.Email = 'shilnara@test.com'
    OR Members.Email = 'jenho@test.com'
    OR Members.Email = 'levi@test.com';



--Add users to the chat 5 charles smack talk
INSERT INTO
    ChatMembers(ChatId, MemberID)
SELECT 103, Members.MemberId
FROM Members
WHERE Members.Email = 'sean@test.com'
    OR Members.Email = 'rin@test.com'
    OR Members.Email = 'shilnara@test.com'
    OR Members.Email = 'jenho@test.com'
    OR Members.Email = 'levi@test.com';


--Add users to the chat 6 books
INSERT INTO
    ChatMembers(ChatId, MemberID)
SELECT 104, Members.MemberId
FROM Members
WHERE Members.Email = 'sean@test.com'
    OR Members.Email = 'rin@test.com'
    OR Members.Email = 'shilnara@test.com'
    OR Members.Email = 'jenho@test.com'
    OR Members.Email = 'levi@test.com';


--Add users to the chat 7 pc building
INSERT INTO
    ChatMembers(ChatId, MemberID)
SELECT 105, Members.MemberId
FROM Members
WHERE Members.Email = 'sean@test.com'
    OR Members.Email = 'rin@test.com'
    OR Members.Email = 'shilnara@test.com'
    OR Members.Email = 'jenho@test.com'
    OR Members.Email = 'levi@test.com';


--Add users to the chat 8 hiking
INSERT INTO
    ChatMembers(ChatId, MemberID)
SELECT 106, Members.MemberId
FROM Members
WHERE Members.Email = 'sean@test.com'
    OR Members.Email = 'rin@test.com'
    OR Members.Email = 'shilnara@test.com'
    OR Members.Email = 'jenho@test.com'
    OR Members.Email = 'levi@test.com';


--Add users to the chat 9 job search
INSERT INTO
    ChatMembers(ChatId, MemberID)
SELECT 107, Members.MemberId
FROM Members
WHERE Members.Email = 'sean@test.com'
    OR Members.Email = 'rin@test.com'
    OR Members.Email = 'shilnara@test.com'
    OR Members.Email = 'jenho@test.com'
    OR Members.Email = 'levi@test.com';


--Add users to the chat 10 ama
INSERT INTO
    ChatMembers(ChatId, MemberID)
SELECT 108, Members.MemberId
FROM Members
WHERE Members.Email = 'sean@test.com'
    OR Members.Email = 'rin@test.com'
    OR Members.Email = 'shilnara@test.com'
    OR Members.Email = 'jenho@test.com'
    OR Members.Email = 'levi@test.com';



--ADD INITIAL MESSAGE TO EACH CHAT
INSERT INTO 
    MESSAGES (CHATID, MESSAGE, MEMBERID) 
VALUES (1000,'Welcome to the chat!',6) RETURNING *;

INSERT INTO 
    MESSAGES (CHATID, MESSAGE, MEMBERID) 
VALUES (99,'Welcome to the chat!',6) RETURNING *;

INSERT INTO 
    MESSAGES (CHATID, MESSAGE, MEMBERID) 
VALUES (100,'Welcome to the chat!',6) RETURNING *;

INSERT INTO 
    MESSAGES (CHATID, MESSAGE, MEMBERID) 
VALUES (101,'Welcome to the chat!',6) RETURNING *;

INSERT INTO 
    MESSAGES (CHATID, MESSAGE, MEMBERID) 
VALUES (102,'Welcome to the chat!',6) RETURNING *;

INSERT INTO 
    MESSAGES (CHATID, MESSAGE, MEMBERID) 
VALUES (103,'Welcome to the chat!',6) RETURNING *;

INSERT INTO 
    MESSAGES (CHATID, MESSAGE, MEMBERID) 
VALUES (104,'Welcome to the chat!',6) RETURNING *;

INSERT INTO 
    MESSAGES (CHATID, MESSAGE, MEMBERID) 
VALUES (105,'Welcome to the chat!',6) RETURNING *;

INSERT INTO 
    MESSAGES (CHATID, MESSAGE, MEMBERID) 
VALUES (106,'Welcome to the chat!',6) RETURNING *;

INSERT INTO 
    MESSAGES (CHATID, MESSAGE, MEMBERID) 
VALUES (107,'Welcome to the chat!',6) RETURNING *;

INSERT INTO 
    MESSAGES (CHATID, MESSAGE, MEMBERID) 
VALUES (108,'Welcome to the chat!',6) RETURNING *;

