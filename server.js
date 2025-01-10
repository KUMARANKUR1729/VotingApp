const express = require('express')
const app = express();
const db = require('./db');


const bodyParser = require('body-parser');
const Candidate = require('./models/Candidate'); // Correct capitalization
const User = require('./models/User'); // Correct capitalization


app.use(bodyParser.json());
const PORT = process.env.PORT || 3000;


// /candidates:  GET -> Get the list of candidates
app.get('/candidates', async(req, res) => {
    try{
        // const candidates = req.params.candidates;
        const response = await Candidate.find();
        console.log("Respomse fetched");
        res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error: "Internal Server Error"});
    }
});



// /vote/:candidateId: POST -> Vote for specific candidate
app.post('/vote/:candidateParty/:aadharnumber', async(req, res) => {
    try{
        
      const candidateParty = req.params.candidateParty;
      const aadharnumber = req.params.aadharnumber; 

      // Step 1: Validate the user by Aadhaar number
      const userResponse = await User.findOne({aadharCardNumber: aadharnumber});
      if(!userResponse){
        return res.status(404).json({error: "User Not Found"});
      }
      
      // Validate the candidate by party
      const candidate = await Candidate.findOne({party: candidateParty});
      if(!candidate){
        return res.status(404).json({error: "Candidate not found for the specified party"});
      }

      // Check if the user has already voted
      if(userResponse.isVoted){
        return res.status(400).json({error: "User has already Voted"});
      }

      // Mark user as having voted
      userResponse.isVoted = true;
      await userResponse.save();


      candidate.votes.push(aadharnumber); // Add Aadhaar to votes array
      candidate.voteCount += 1; // Increment vote count
      await candidate.save();

      res.status(200).json({
        message: `Vote cast successfully`
      });
    }
    catch(err){
        console.log(err);
        res.status(500).json({error : "Internal Server Error"});
    }
    
});



// /vote/counts: GET -> Get the list of candidates sorted by their vote counts.
app.get('/vote/counts', async(req, res) => {
try{
    const candidates = await Candidate.find().sort({votes: -1});

    if(!candidates || candidates.length === 0){
        return res.status(200).json({message: "No candidate found", cadidates: []});
    }

    const response = candidates.map(candidate => ({
        name: candidate.name,
        party: candidate.party,
        votes: candidate.voteCount,
    }));

    res.send(200).json({
        message: "Candidate sorted by vote counts",
        candidates: response,
    });

}
catch(err){
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
);


// /profile:  GET -> Get the user's profile information
app.get('/profile/:aadharnumber', async(req, res) => {
    try{
        const aadharnumber = req.params.aadharnumber;
        const response = await User.findOne({aadharCardNumber: admissionNumber});
        if (!response) {
            return res.status(404).json({ error: 'User not found' });
          }
      
          res.status(200).json(response);
    }catch(err){
        console.log(err);
        res.status(500).json({error: "Internal Server Error"});
    }
});




// Endpoint for adding candidate in the election
app.post('/newCandidate', async(req, res) => {
    try{
        const {name, party, age} = req.body;

        if(!name || !party || !age){
            return res.status(400).json({error: "All fields are required"});
        }
        const existingCandidate = await Candidate.findOne({party});
        if(existingCandidate){
            return res.status(400).json({error: "Candidate with this party already exists"});
        }

        const candidate = new Candidate({
            name,
            party,
            age,
            
          });

          await candidate.save();


          res.status(201).json({
            message: 'Candidate added successfully',
            candidate: {
              id: candidate._id,
              name: candidate.name,
              party: candidate.party,
              age: candidate.age,
            },
        });

    }catch(err){
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});




// Endpoint for adding User in the election
app.post('/users', async (req, res) => {
    try {
        console.log("hi");
      const { name, age, email, Mobno, address, aadharCardNumber, role } = req.body;
  
      // Validate required fields
      if (!name || !age || !address || !aadharCardNumber ) {
        return res.status(400).json({ error: 'All required fields must be provided' });
      }
  
      // Check if Aadhaar number already exists
      const existingUser = await User.findOne({ aadharCardNumber });
      if (existingUser) {
        return res.status(400).json({ error: 'Aadhaar number already exists' });
      }


      const newUser = new User({
        name,
        age,
        email,
        Mobno,
        address,
        aadharCardNumber,
        role: role || 'voter', // Default role is 'voter'
      });
        
      await newUser.save();

      res.status(201).json({
        message: 'User registered successfully',
        userId: newUser._id,
      });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });



app.listen(PORT, () => {
    console.log("Server is running on http://localhost:3000");
});