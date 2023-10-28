User.find({ "email": req.body.email })
    .then(
        result => {
            console.log(result.length);
            if (result.length !== 0) {
                res.json({
                    message: ' User Already Exist',
                    status: false,

                })
                } else {
                newUser.save()
                    .then(result => {
                        console.log(result);
                        res.redirect("/");
                    })
                    .catch(err => {
                        console.error(err);
                        res.status(500).send("Error saving the user.");
                    });
            }
        }
    )
    .catch(
        error => {
            res.json({
                message: ' User Register fail',
                status: false,
            })
        }
    )
