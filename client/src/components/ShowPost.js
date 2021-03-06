import React, {useCallback, useEffect, useState} from "react";
import {ErrorMessage, Field, Form, Formik} from "formik";
import Button from "@material-ui/core/Button";
import {useParams} from "react-router-dom";
import * as Yup from "yup";

import Loading from "./Loading";
import useAbortableHttp from "../hooks/abortableHttp.hook";

export default function ShowPost() {
    const {postId} = useParams();

    const {abort, loading, request} = useAbortableHttp();

    const [post, setPost] = useState(null);

    const getPost = useCallback(async function () {
        const data = await request(`/api/visitor/post/${postId}`, {
            method: "GET"
        });
        if (data && data.result) {
            setPost(data.result);
        }
    }, [postId])

    useEffect(() => {
        getPost();
        return function () {
            abort();
        }
    }, [getPost])

    const initialValues = {
        description: ""
    };

    const validationSchema = Yup.object({
        description: Yup.string()
            .max(500, "Must be 500 characters or less")
            .required('This field is required')
    });

    async function onSubmit(values) {
        await request(`/api/visitor/post/${postId}/leave_comment`, {
            method: "POST",
            body: values
        });
        getPost();
    }

    return (
        <div className="container pt-2">
            {loading ? (<Loading/>) : (
                post && (
                    <div>
                        Title: <br/>
                        {post.title} <br/>
                        Description: <br/>
                        {post.description} <br/>
                        Publication date: {new Date(post.publication_date).toUTCString()} <br/>

                        Author: {post.nickname} <br/>
                        <hr/>
                        <div className="leave_comment">
                            <Formik
                                initialValues={initialValues}
                                validationSchema={validationSchema}
                                onSubmit={onSubmit}
                            >
                                {() => {
                                    return (
                                        <Form>
                                            Leave comment:
                                            <div className="input_container mb-2">
                                                <div className="label_container">
                                                    <label htmlFor={"description"}>Description:</label>
                                                </div>
                                                <div className="input">
                                                    <Field className="w-100" id={"description"} name={"description"}
                                                           type="text"/>
                                                </div>
                                                <div className="errors_container">
                                                    <ErrorMessage name={"description"}/>
                                                </div>
                                            </div>
                                            <Button variant="contained" color="secondary" type="submit"
                                                    disabled={loading}>
                                                Leave comment
                                            </Button>
                                        </Form>
                                    );
                                }}
                            </Formik>
                        </div>
                        <hr/>
                        <div className="comments">
                            {post.comments && post.comments.map((comment, i) => {
                                return (
                                    <div key={comment.publication_date + i}>
                                        Description: <br/>
                                        {comment.description} <br/>
                                        Publication date: {new Date(comment.publication_date).toUTCString()} <br/>
                                        <hr/>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )
            )}
        </div>
    );
}