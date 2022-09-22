# Refactoring

You've been asked to refactor the function `deterministicPartitionKey` in [`dpk.js`](dpk.js) to make it easier to read and understand without changing its functionality. For this task, you should:

1. Write unit tests to cover the existing functionality and ensure that your refactor doesn't break it. We typically use `jest`, but if you have another library you prefer, feel free to use it.
2. Refactor the function to be as "clean" and "readable" as possible. There are many valid ways to define those words - use your own personal definitions, but be prepared to defend them. Note that we do like to use the latest JS language features when applicable.
3. Write up a brief (~1 paragraph) explanation of why you made the choices you did and why specifically your version is more "readable" than the original.

You will be graded on the exhaustiveness and quality of your unit tests, the depth of your refactor, and the level of insight into your thought process provided by the written explanation.

## Your Explanation Here

Looking at the original code, it seems a lot was going on. I observed that the code was mostly trying to assign a value to a candidate so I abstracted that into a function to avoid having a temp field. Also, the code has a lot of if/else statements which makes the logic difficult to follow. I grouped the logic and return early as I can to avoid unnecessary else statements. I also took advantage of ternary operators, so that I can assign the result of some conditional to a variable. Furthermore, I improved the naming of the variable(The function name suggests determining partition key and we are returning candidate). I also move some common logic and constants to a util file to make the code more readable. In all my approach is more readable because I broke / grouped common logic into a separate function.
